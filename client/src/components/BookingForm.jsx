import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import {
  TIPI_PEDIATRA,
  INTERVALLI,
  generaSlot,
  oggiISO,
  chiaveIntervallo,
} from '../helpers';

const MAX_PER_SLOT = 2;

export default function BookingForm({ specialista, isPediatra, tick, notify }) {
  // Minuteria personale per ogni specialista, salvata nel localStorage
  const [intervallo, setIntervallo] = useState(() => {
    const v = localStorage.getItem(chiaveIntervallo(specialista));
    return v ? Number(v) : 15;
  });

  const [data, setData] = useState(oggiISO());
  const [orario, setOrario] = useState('');
  const [tipo, setTipo] = useState('Visita');
  const [cognome, setCognome] = useState('');
  const [nome, setNome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [conteggi, setConteggi] = useState({}); // { "10:15": 2, ... }
  const [busy, setBusy] = useState(false);

  // Quando cambio specialista ricarico la sua minuteria salvata
  useEffect(() => {
    const v = localStorage.getItem(chiaveIntervallo(specialista));
    setIntervallo(v ? Number(v) : 15);
    setTipo('Visita');
    setOrario('');
  }, [specialista]);

  // Salva la minuteria del singolo specialista
  function cambiaIntervallo(v) {
    setIntervallo(v);
    setOrario('');
    localStorage.setItem(chiaveIntervallo(specialista), String(v));
  }

  const slots = useMemo(() => generaSlot(intervallo), [intervallo]);

  // Conta le prenotazioni per ogni orario (per data + specialista del FORM)
  useEffect(() => {
    let attivo = true;
    api
      .getBookings(specialista, data)
      .then((rows) => {
        if (!attivo) return;
        const c = {};
        for (const r of rows) c[r.orario] = (c[r.orario] || 0) + 1;
        setConteggi(c);
      })
      .catch(() => {});
    return () => { attivo = false; };
  }, [specialista, data, tick]);

  async function salva(e) {
    e.preventDefault();
    if (!orario) return notify('Seleziona un orario', true);
    if (!cognome.trim() || !nome.trim()) return notify('Inserisci cognome e nome', true);
    setBusy(true);
    try {
      await api.addBooking({
        specialista,
        data,
        orario,
        tipo: isPediatra ? tipo : 'Visita',
        cognome,
        nome,
        telefono,
      });
      notify('Appuntamento salvato ✅');
      // pulisco i campi del paziente, mantengo data e orario
      setCognome('');
      setNome('');
      setTelefono('');
      setOrario('');
    } catch (err) {
      notify('⚠️ ' + err.message, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="glass panel form-panel" onSubmit={salva}>
      <div className="form-top">
        <label className="lbl">⏱️ Durata visita ({specialista})</label>
        <div className="interval-row">
          {INTERVALLI.map((v) => (
            <button
              type="button"
              key={v}
              className={'pill ' + (intervallo === v ? 'pill-on' : '')}
              onClick={() => cambiaIntervallo(v)}
            >
              {v} min
            </button>
          ))}
        </div>
      </div>

      <label className="lbl">📅 Data</label>
      <input type="date" value={data} onChange={(e) => setData(e.target.value)} />

      <label className="lbl">🕐 Orario (08:00 – 19:00)</label>
      <div className="slot-grid">
        {slots.map((s) => {
          const n = conteggi[s] || 0;
          const pieno = n >= MAX_PER_SLOT;
          const selez = orario === s;
          return (
            <button
              type="button"
              key={s}
              disabled={pieno}
              className={
                'slot ' +
                (selez ? 'slot-sel ' : '') +
                (pieno ? 'slot-full ' : n === 1 ? 'slot-half ' : '')
              }
              onClick={() => setOrario(s)}
              title={pieno ? 'Orario pieno' : n === 1 ? 'Un posto occupato su due' : 'Libero'}
            >
              {s}
              {n === 1 && <span className="slot-tag"> (1/2)</span>}
            </button>
          );
        })}
      </div>

      <label className="lbl">🏷️ Tipologia visita</label>
      <select value={isPediatra ? tipo : 'Visita'} disabled={!isPediatra} onChange={(e) => setTipo(e.target.value)}>
        {(isPediatra ? TIPI_PEDIATRA : ['Visita']).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="due-campi">
        <div>
          <label className="lbl">Cognome</label>
          <input value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Cognome" />
        </div>
        <div>
          <label className="lbl">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
        </div>
      </div>

      <label className="lbl">📞 Telefono</label>
      <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Telefono (facoltativo)" />

      <button className="btn-primary big" disabled={busy}>
        {busy ? 'Salvataggio…' : '➕ Aggiungi appuntamento'}
      </button>
    </form>
  );
}
