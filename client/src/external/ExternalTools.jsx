import { STRUMENTI_ESTERNI, apriStrumento } from './tools';

// Scorciatoie verso strumenti esterni (siti ufficiali, aperti in finestra
// affiancata). Due vesti: compatta per la topbar, estesa dentro l'assistente.
export default function ExternalTools({ variante = 'topbar', notify }) {
  function apri(s) {
    const esito = apriStrumento(s);
    if (esito === 'bloccato') {
      notify?.(`⚠️ Il browser ha bloccato la finestra. Consenti i popup per questo sito e riprova.`, true);
    } else if (esito === 'scheda') {
      notify?.(`${s.nome} aperto in una nuova scheda`);
    }
  }

  if (variante === 'topbar') {
    return (
      <>
        {STRUMENTI_ESTERNI.map((s) => (
          <button
            key={s.id}
            className="btn-ghost ext-btn"
            onClick={() => apri(s)}
            title={`${s.nota}\nSi apre in una finestra affiancata (sito ufficiale).`}
          >
            {s.emoji} {s.nome}
          </button>
        ))}
      </>
    );
  }

  return (
    <div className="ext-riga">
      {STRUMENTI_ESTERNI.map((s) => (
        <button key={s.id} className="ext-chip" onClick={() => apri(s)} title={s.nota}>
          <span>{s.emoji}</span> {s.nome} <small>↗</small>
        </button>
      ))}
    </div>
  );
}
