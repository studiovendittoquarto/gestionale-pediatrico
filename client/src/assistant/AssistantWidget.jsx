import { useEffect, useRef, useState } from 'react';
import { assistantApi, fileToImagePart } from './assistantApi';
import './assistant.css';

// Assistente fluttuante non invasivo: bolla in basso a destra che si apre
// in un pannello. Chat + foto effimere. Isolato dal resto del gestionale.
export default function AssistantWidget() {
  const [aperto, setAperto] = useState(false);
  const [stato, setStato] = useState({ configured: false, provider: 'none' });
  const [disclaimer, setDisclaimer] = useState('');
  const [messaggi, setMessaggi] = useState([
    { ruolo: 'ai', testo: 'Ciao! Sono il tuo assistente di supporto. Fai una domanda o allega una foto. (Non inserire dati identificativi del paziente.)' },
  ]);
  const [input, setInput] = useState('');
  const [foto, setFoto] = useState(null); // { file, preview }
  const [busy, setBusy] = useState(false);
  const fineLista = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    assistantApi.status().then((s) => {
      setStato(s);
      if (s.disclaimer) setDisclaimer(s.disclaimer);
    });
  }, []);

  useEffect(() => {
    fineLista.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messaggi, aperto]);

  function aggiungi(ruolo, testo) {
    setMessaggi((m) => [...m, { ruolo, testo }]);
  }

  async function scegliFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto({ file, preview: URL.createObjectURL(file) });
  }

  async function invia() {
    const testo = input.trim();
    if (!testo && !foto) return;
    if (!stato.configured) {
      aggiungi('ai', '⚠️ Assistente non ancora attivo: manca la chiave AI (vedi istruzioni). Le funzioni senza AI restano disponibili.');
      return;
    }
    setBusy(true);
    aggiungi('me', testo + (foto ? ' 📎 [foto]' : ''));
    setInput('');
    try {
      let risposta;
      if (foto) {
        const image = await fileToImagePart(foto.file);
        risposta = await assistantApi.vision(testo || 'Cosa osservi in questa immagine? Fornisci supporto non vincolante.', image);
        setFoto(null);
      } else {
        risposta = await assistantApi.chat(testo);
      }
      aggiungi('ai', risposta.reply);
    } catch (err) {
      aggiungi('ai', '⚠️ ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      invia();
    }
  }

  return (
    <>
      {/* Bolla fluttuante */}
      <button
        className={'ai-fab ' + (aperto ? 'ai-fab-hidden' : '')}
        onClick={() => setAperto(true)}
        title="Assistente"
      >
        <span className="ai-fab-emoji">🩺</span>
        <span className="ai-fab-pulse" />
      </button>

      {/* Pannello */}
      {aperto && (
        <div className="ai-panel glass">
          <div className="ai-head">
            <div className="ai-title">
              <span className="ai-dot-emoji">🩺</span>
              <div>
                <strong>Assistente</strong>
                <small className={'ai-state ' + (stato.configured ? 'on' : 'off')}>
                  {stato.configured ? `attivo · ${stato.provider}` : 'non configurato'}
                </small>
              </div>
            </div>
            <button className="ai-close" onClick={() => setAperto(false)} title="Chiudi">─</button>
          </div>

          <div className="ai-disclaimer">⚕️ {disclaimer || 'Strumento di supporto non vincolante. La decisione clinica spetta al medico.'}</div>

          <div className="ai-messaggi">
            {messaggi.map((m, i) => (
              <div key={i} className={'ai-msg ai-msg-' + m.ruolo}>
                {m.testo}
              </div>
            ))}
            {busy && <div className="ai-msg ai-msg-ai ai-typing">sto pensando…</div>}
            <div ref={fineLista} />
          </div>

          {foto && (
            <div className="ai-foto-anteprima">
              <img src={foto.preview} alt="anteprima" />
              <span>Foto pronta (non verrà salvata)</span>
              <button onClick={() => setFoto(null)}>✕</button>
            </div>
          )}

          <div className="ai-input-row">
            <button className="ai-attach" onClick={() => fileRef.current?.click()} title="Allega foto">📎</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={scegliFoto}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Scrivi una domanda…"
            />
            <button className="ai-send" onClick={invia} disabled={busy}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
