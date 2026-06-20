import { useEffect, useState } from 'react';
import { api, getToken, clearToken } from './api';
import { socket } from './socket';
import Login from './components/Login';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import SpecialistsModal from './components/SpecialistsModal';
import AssistantWidget from './assistant/AssistantWidget';

export default function App() {
  const [loggato, setLoggato] = useState(!!getToken());
  const [specialisti, setSpecialisti] = useState([]);
  const [tabAttivo, setTabAttivo] = useState('Pediatra'); // chiave interna dello specialista attivo
  // Nome visualizzato per il tab fisso "Pediatra", personalizzabile e salvato sul dispositivo
  const [pediatraLabel, setPediatraLabel] = useState(
    () => localStorage.getItem('gp_pediatra_label') || 'Dott. VENDITTO'
  );
  const [modale, setModale] = useState(false);

  // Nome da mostrare: per il tab fisso usa l'etichetta personalizzata
  const nomeVisibile = (s) => (s === 'Pediatra' ? pediatraLabel : s);

  function rinominaPediatra(nuovo) {
    const v = (nuovo || '').trim() || 'Pediatra';
    setPediatraLabel(v);
    localStorage.setItem('gp_pediatra_label', v);
  }
  const [tick, setTick] = useState(0); // incrementato ad ogni evento real-time -> fa ricaricare le liste
  const [online, setOnline] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(msg, errore = false) {
    setToast({ msg, errore });
    setTimeout(() => setToast(null), 3000);
  }

  // Carica gli specialisti dopo il login
  useEffect(() => {
    if (!loggato) return;
    api.getSpecialisti().then(setSpecialisti).catch(() => {});
  }, [loggato]);

  // Socket.io: aggiorna tutto in tempo reale
  useEffect(() => {
    if (!loggato) return;

    const onConnect = () => setOnline(true);
    const onDisconnect = () => setOnline(false);
    const refresh = () => setTick((t) => t + 1);

    const onSpecCreated = (s) => {
      setSpecialisti((prev) => (prev.find((x) => x.id === s.id) ? prev : [...prev, s]));
      notify(`Nuovo specialista: ${s.nome}`);
    };
    const onSpecDeleted = (s) => {
      setSpecialisti((prev) => prev.filter((x) => x.id !== s.id));
      setTabAttivo((cur) => (cur === s.nome ? 'Pediatra' : cur));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('booking:created', refresh);
    socket.on('booking:updated', refresh);
    socket.on('booking:deleted', refresh);
    socket.on('specialist:created', onSpecCreated);
    socket.on('specialist:deleted', (s) => { onSpecDeleted(s); refresh(); });

    setOnline(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('booking:created', refresh);
      socket.off('booking:updated', refresh);
      socket.off('booking:deleted', refresh);
      socket.off('specialist:created', onSpecCreated);
      socket.off('specialist:deleted');
    };
  }, [loggato]);

  function logout() {
    clearToken();
    setLoggato(false);
  }

  if (!loggato) return <Login onLogin={() => setLoggato(true)} />;

  const isPediatra = tabAttivo === 'Pediatra';

  return (
    <div className="app">
      <header className="glass topbar">
        <div className="brand">🩺 <span>Gestionale Pediatrico</span></div>

        <nav className="tabs">
          <button
            className={'tab ' + (isPediatra ? 'tab-on' : '')}
            onClick={() => setTabAttivo('Pediatra')}
          >
            {pediatraLabel}
          </button>
          {specialisti.map((s) => (
            <button
              key={s.id}
              className={'tab ' + (tabAttivo === s.nome ? 'tab-on' : '')}
              onClick={() => setTabAttivo(s.nome)}
            >
              {s.nome}
            </button>
          ))}
          <button className="tab tab-manage" onClick={() => setModale(true)}>⚙️ Gestisci Specialisti</button>
        </nav>

        <div className="top-right">
          <span className={'dot ' + (online ? 'dot-on' : 'dot-off')} title={online ? 'Sincronizzato in tempo reale' : 'Riconnessione…'}>
            {online ? '● Live' : '○ Offline'}
          </span>
          <button className="btn-ghost" onClick={logout}>Esci</button>
        </div>
      </header>

      <main className="layout">
        <section className="col-sx">
          <h2 className="col-title">Nuovo appuntamento · {nomeVisibile(tabAttivo)}</h2>
          <BookingForm key={tabAttivo} specialista={tabAttivo} nomeVisibile={nomeVisibile(tabAttivo)} isPediatra={isPediatra} tick={tick} notify={notify} />
        </section>

        <section className="col-dx">
          <h2 className="col-title">Agenda · {nomeVisibile(tabAttivo)}</h2>
          <BookingList specialista={tabAttivo} tick={tick} notify={notify} />
        </section>
      </main>

      {modale && (
        <SpecialistsModal
          specialisti={specialisti}
          pediatraLabel={pediatraLabel}
          onRenamePediatra={rinominaPediatra}
          onClose={() => setModale(false)}
          notify={notify}
        />
      )}

      {toast && <div className={'toast ' + (toast.errore ? 'toast-err' : '')}>{toast.msg}</div>}

      {/* Assistente AI fluttuante — modulo isolato, non interferisce col gestionale */}
      <AssistantWidget />
    </div>
  );
}
