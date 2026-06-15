// ============================================================
//  Gestionale Pediatrico - Server
//  Express (API REST) + Socket.io (real-time) + Postgres
//  In produzione serve anche il frontend React (client/dist).
// ============================================================
require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const db = require('./db');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chiave-di-sviluppo-non-sicura';
const APP_USERNAME = process.env.APP_USERNAME || 'pediatra';
const APP_PASSWORD = process.env.APP_PASSWORD || 'pediatra';
const MAX_PER_SLOT = 2; // overbooking massimo per ogni orario

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ---------- Autenticazione (credenziale unica condivisa) ----------
function makeToken() {
  return jwt.sign({ role: 'staff' }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Non autorizzato' });
  }
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === APP_USERNAME && password === APP_PASSWORD) {
    return res.json({ token: makeToken() });
  }
  res.status(401).json({ error: 'Nome utente o password errati' });
});

// ---------- API SPECIALISTI ----------
app.get('/api/specialisti', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM specialisti ORDER BY id ASC');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

app.post('/api/specialisti', authMiddleware, async (req, res) => {
  const nome = (req.body?.nome || '').trim();
  if (!nome) return res.status(400).json({ error: 'Nome mancante' });
  if (nome.toLowerCase() === 'pediatra')
    return res.status(400).json({ error: 'Pediatra è già presente' });
  try {
    const { rows } = await db.query(
      'INSERT INTO specialisti (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING RETURNING *',
      [nome]
    );
    if (!rows.length) return res.status(409).json({ error: 'Specialista già esistente' });
    io.emit('specialist:created', rows[0]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

app.delete('/api/specialisti/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM specialisti WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Non trovato' });
    const spec = rows[0];
    await db.query('DELETE FROM specialisti WHERE id = $1', [req.params.id]);
    // Rimuove anche gli appuntamenti collegati a quello specialista
    await db.query('DELETE FROM bookings WHERE specialista = $1', [spec.nome]);
    io.emit('specialist:deleted', spec);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

// ---------- API APPUNTAMENTI ----------
// Lista per specialista + data
app.get('/api/bookings', authMiddleware, async (req, res) => {
  const { specialista, data } = req.query;
  try {
    let sql = 'SELECT * FROM bookings';
    const params = [];
    const where = [];
    if (specialista) { params.push(specialista); where.push(`specialista = $${params.length}`); }
    if (data) { params.push(data); where.push(`data = $${params.length}`); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY orario ASC, creato_il ASC';
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  const b = req.body || {};
  const required = ['specialista', 'data', 'orario', 'cognome', 'nome'];
  for (const k of required) {
    if (!String(b[k] || '').trim()) return res.status(400).json({ error: `Campo "${k}" mancante` });
  }
  try {
    // Controllo overbooking: massimo 2 per orario/specialista/data
    const { rows: count } = await db.query(
      'SELECT COUNT(*)::int AS n FROM bookings WHERE specialista = $1 AND data = $2 AND orario = $3',
      [b.specialista, b.data, b.orario]
    );
    if (count[0].n >= MAX_PER_SLOT) {
      return res.status(409).json({ error: 'Orario pieno (massimo 2 prenotazioni)' });
    }
    const { rows } = await db.query(
      `INSERT INTO bookings (specialista, data, orario, tipo, cognome, nome, telefono, stato)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'attesa') RETURNING *`,
      [
        b.specialista,
        b.data,
        b.orario,
        b.tipo || 'Visita',
        b.cognome.trim(),
        b.nome.trim(),
        (b.telefono || '').trim(),
      ]
    );
    io.emit('booking:created', rows[0]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

// Cambia stato (attesa <-> completata)
app.patch('/api/bookings/:id', authMiddleware, async (req, res) => {
  const stato = req.body?.stato;
  if (!['attesa', 'completata'].includes(stato))
    return res.status(400).json({ error: 'Stato non valido' });
  try {
    const { rows } = await db.query(
      'UPDATE bookings SET stato = $1 WHERE id = $2 RETURNING *',
      [stato, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Non trovato' });
    io.emit('booking:updated', rows[0]);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

app.delete('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Non trovato' });
    io.emit('booking:deleted', rows[0]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore database' });
  }
});

// ---------- Health check (utile per keep-alive) ----------
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- Serve il frontend React buildato (produzione) ----------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ---------- Socket.io ----------
io.on('connection', (socket) => {
  console.log('[socket] client connesso:', socket.id);
  socket.on('disconnect', () => console.log('[socket] client disconnesso:', socket.id));
});

// ---------- Avvio ----------
db.init()
  .then(() => {
    server.listen(PORT, () => console.log(`✅ Server avviato su porta ${PORT}`));
  })
  .catch((e) => {
    console.error('Errore inizializzazione DB:', e);
    // Avvia comunque il server così il frontend e /api/health rispondono
    server.listen(PORT, () => console.log(`⚠️  Server avviato (DB non pronto) su porta ${PORT}`));
  });
