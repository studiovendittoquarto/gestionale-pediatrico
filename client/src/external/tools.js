// ============================================================
//  Strumenti esterni — apertura in finestra affiancata
//
//  NIENTE iframe: DougallGPT (come molti servizi sanitari) invia
//  l'header "X-Frame-Options: SAMEORIGIN", quindi il browser vieta
//  di incorporarlo in un'altra pagina. Qui ci limitiamo ad APRIRE
//  il sito ufficiale in una sua finestra: nessun dato loro viene
//  copiato, nessun login viene automatizzato, nessun contenuto
//  viene ripubblicato. E' un collegamento, come un preferito.
//
//  L'accesso avviene con l'account personale del medico, sul sito
//  ufficiale del fornitore, secondo i suoi termini d'uso.
// ============================================================

export const STRUMENTI_ESTERNI = [
  {
    id: 'dougallgpt',
    nome: 'DougallGPT',
    emoji: '🧠',
    url: 'https://dougallgpt.com/',
    nota: 'Assistente AI per medici — serve il proprio account (registrazione riservata ai professionisti sanitari).',
    larghezza: 480,
  },
];

// Riferimenti alle finestre gia' aperte, per riportarle a fuoco
// invece di aprirne una nuova ad ogni click.
const finestre = {};

export function apriStrumento(strumento) {
  const gia = finestre[strumento.id];
  if (gia && !gia.closed) {
    gia.focus();
    return 'focus';
  }

  // Finestra stretta e alta, appoggiata al bordo destro dello schermo,
  // cosi' il gestionale resta leggibile a sinistra.
  const schermoL = window.screen?.availWidth || 1280;
  const schermoH = window.screen?.availHeight || 800;
  const larghezza = Math.min(strumento.larghezza || 480, Math.max(360, schermoL - 40));
  const altezza = Math.max(480, schermoH - 80);
  const left = Math.max(0, schermoL - larghezza - 20);
  const opzioni = `popup=yes,width=${larghezza},height=${altezza},left=${left},top=40,resizable=yes,scrollbars=yes`;

  const win = window.open(strumento.url, 'gp_' + strumento.id, opzioni);
  if (win) {
    finestre[strumento.id] = win;
    win.focus();
    return 'aperta';
  }

  // Popup bloccato dal browser: ripiego sulla scheda normale.
  const scheda = window.open(strumento.url, '_blank', 'noopener,noreferrer');
  return scheda ? 'scheda' : 'bloccato';
}
