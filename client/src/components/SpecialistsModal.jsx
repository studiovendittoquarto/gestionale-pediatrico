import { useState } from 'react';
import { api } from '../api';

export default function SpecialistsModal({ specialisti, onClose, notify }) {
  const [nome, setNome] = useState('');
  const [busy, setBusy] = useState(false);

  async function aggiungi(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setBusy(true);
    try {
      await api.addSpecialista(nome.trim());
      setNome('');
      notify('Specialista aggiunto ✅');
    } catch (err) {
      notify('⚠️ ' + err.message, true);
    } finally {
      setBusy(false);
    }
  }

  async function rimuovi(s) {
    if (!confirm(`Rimuovere "${s.nome}"?\nVerranno eliminati anche i suoi appuntamenti.`)) return;
    try {
      await api.delSpecialista(s.id);
      notify('Specialista rimosso');
    } catch (err) {
      notify('⚠️ ' + err.message, true);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Gestisci Specialisti</h2>
          <button className="btn-icon" onClick={onClose} title="Chiudi">✕</button>
        </div>

        <form className="add-spec" onSubmit={aggiungi}>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Es. Nutrizionista, Logopedista…"
          />
          <button className="btn-primary" disabled={busy}>+ Aggiungi</button>
        </form>

        <div className="spec-list">
          <div className="spec-row fixed">
            <span>🩺 Pediatra</span>
            <span className="spec-fisso">fisso</span>
          </div>
          {specialisti.length === 0 && (
            <p className="vuoto">Nessuno specialista aggiunto.</p>
          )}
          {specialisti.map((s) => (
            <div className="spec-row" key={s.id}>
              <span>👩‍⚕️ {s.nome}</span>
              <button className="btn-danger small" onClick={() => rimuovi(s)}>Rimuovi</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
