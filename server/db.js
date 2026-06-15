// ============================================================
//  Database layer (PostgreSQL)
//  Usa una connessione Postgres (es. Neon.tech, gratis e sempre attivo).
//  Crea le tabelle automaticamente al primo avvio.
// ============================================================
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('\n[ERRORE] Manca la variabile DATABASE_URL.');
  console.error('Imposta la stringa di connessione del database (vedi .env.example).\n');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon e gli altri Postgres cloud richiedono SSL
  ssl: { rejectUnauthorized: false },
});

async function query(text, params) {
  return pool.query(text, params);
}

// Crea le tabelle se non esistono
async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS specialisti (
      id    SERIAL PRIMARY KEY,
      nome  TEXT NOT NULL UNIQUE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id          SERIAL PRIMARY KEY,
      specialista TEXT NOT NULL,          -- "Pediatra" oppure il nome dello specialista
      data        TEXT NOT NULL,          -- formato YYYY-MM-DD
      orario      TEXT NOT NULL,          -- formato HH:MM
      tipo        TEXT NOT NULL DEFAULT 'Visita',
      cognome     TEXT NOT NULL,
      nome        TEXT NOT NULL,
      telefono    TEXT,
      stato       TEXT NOT NULL DEFAULT 'attesa',  -- 'attesa' | 'completata'
      creato_il   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_bookings_lookup
               ON bookings (specialista, data);`);

  console.log('[DB] Tabelle pronte.');
}

module.exports = { query, init, pool };
