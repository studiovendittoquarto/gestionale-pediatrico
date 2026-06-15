import { useEffect, useState } from 'react';
import { api } from '../api';
import { oggiISO, dataLeggibile } from '../helpers';

export default function BookingList({ specialista, tick, notify }) {
  const [data, setData] = useState(oggiISO());
  const [bookings, setBookings] = useState([]);
  const [caricamento, setCaricamento] = useState(false);

  useEffect(() => {
    let attivo = true;
    setCaricamento(true);
    api
      .getBookings(specialista, data)
      .then((rows) => attivo && setBookings(rows))
      .catch(() => {})
      .finally(() => attivo && setCaricamento(false));
    return () => { attivo = false; };
  }, [specialista, data, tick]);

  async function cambiaStato(b) {
    try {
      await api.setStato(b.id, b.stato === 'completata' ? 'attesa' : 'completata');
    } catch (err) {
      notify('⚠️ ' + err.message, true);
    }
  }

  async function elimina(b) {
    if (!confirm(`Eliminare l'appuntamento di ${b.cognome} ${b.nome} alle ${b.orario}?`)) return;
    try {
      await api.delBooking(b.id);
      notify('Appuntamento eliminato');
    } catch (err) {
      notify('⚠️ ' + err.message, true);
    }
  }

  const completati = bookings.filter((b) => b.stato === 'completata').length;

  return (
    <div className="glass panel list-panel">
      <div className="list-head">
        <div>
          <label className="lbl">📆 Giorno</label>
          <div className="date-row">
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            <button type="button" className="pill" onClick={() => setData(oggiISO())}>Oggi</button>
          </div>
        </div>
        <div className="contatore">
          <strong>{bookings.length}</strong>
          <span>appuntamenti</span>
          {bookings.length > 0 && <small>{completati} completati</small>}
        </div>
      </div>

      <div className="data-titolo">{dataLeggibile(data)}</div>

      {caricamento && <p className="vuoto">Caricamento…</p>}
      {!caricamento && bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🗓️</div>
          <p>Nessun appuntamento per questo giorno.</p>
        </div>
      )}

      <div className="cards">
        {bookings.map((b) => {
          const bilancio = b.tipo === 'Bilancio';
          const fatto = b.stato === 'completata';
          return (
            <div className={'card-appt ' + (fatto ? 'card-done ' : '') + (bilancio ? 'card-bilancio ' : '')} key={b.id}>
              <div className="card-ora">{b.orario}</div>
              <div className="card-body">
                <div className="card-badges">
                  <span className={'badge tipo ' + (bilancio ? 'badge-bilancio' : '')}>{b.tipo}</span>
                  <span className={'badge stato ' + (fatto ? 'stato-ok' : 'stato-attesa')}>
                    {fatto ? '✔ Completata' : '⏳ In attesa'}
                  </span>
                </div>
                <div className={'card-nome ' + (bilancio ? 'nome-bilancio' : '')}>
                  {b.cognome} {b.nome}
                </div>
                {b.telefono && (
                  <a className="card-tel" href={'tel:' + b.telefono}>📞 {b.telefono}</a>
                )}
              </div>
              <div className="card-actions">
                <button className={'btn-ok small ' + (fatto ? 'attivo' : '')} onClick={() => cambiaStato(b)}>
                  {fatto ? '↩ Riapri' : '✔ Completa'}
                </button>
                <button className="btn-danger small" onClick={() => elimina(b)}>🗑 Elimina</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
