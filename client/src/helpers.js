// Tipologie di visita disponibili SOLO per il Pediatra
export const TIPI_PEDIATRA = ['Visita', 'Bilancio', 'Controllo', 'Prima Visita', 'Vaccino', 'Urgenza'];

// Intervalli orari selezionabili (minuti)
export const INTERVALLI = [10, 15, 20, 25, 30];

// Durata usata all'apertura quando lo specialista non ha ancora una preferenza salvata
export const INTERVALLO_DEFAULT = 10;

// Genera gli orari dalle 08:00 alle 19:00 con l'intervallo scelto
export function generaSlot(intervallo) {
  const slots = [];
  const inizio = 8 * 60; // 08:00 in minuti
  const fine = 19 * 60; // 19:00 in minuti
  for (let m = inizio; m <= fine; m += intervallo) {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${h}:${mm}`);
  }
  return slots;
}

// Data di oggi in formato YYYY-MM-DD (orario locale, non UTC)
export function oggiISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}

// Mostra una data YYYY-MM-DD in formato leggibile italiano
export function dataLeggibile(iso) {
  if (!iso) return '';
  const [y, m, g] = iso.split('-');
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const d = new Date(Number(y), Number(m) - 1, Number(g));
  return `${giorni[d.getDay()]} ${g}/${m}/${y}`;
}

// Chiave localStorage per la minuteria personale di ogni specialista
export function chiaveIntervallo(specialista) {
  return `gp_intervallo_${specialista}`;
}

// Legge la minuteria salvata per uno specialista (10 min se non c'è nulla di valido)
export function leggiIntervallo(specialista) {
  const v = Number(localStorage.getItem(chiaveIntervallo(specialista)));
  return INTERVALLI.includes(v) ? v : INTERVALLO_DEFAULT;
}

// Migrazione una-tantum: azzera le vecchie preferenze (default storico 15 min)
// così all'apertura si parte da 10. Dopo la prima volta non tocca più nulla:
// le minuterie scelte da qui in avanti restano ricordate.
export function migraIntervalloDefault() {
  const FLAG = 'gp_default_10min_v1';
  if (localStorage.getItem(FLAG)) return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith('gp_intervallo_'))
    .forEach((k) => localStorage.removeItem(k));
  localStorage.setItem(FLAG, '1');
}
