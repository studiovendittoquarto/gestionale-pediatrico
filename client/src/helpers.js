// Tipologie di visita disponibili SOLO per il Pediatra
export const TIPI_PEDIATRA = ['Visita', 'Bilancio', 'Controllo', 'Prima Visita', 'Vaccino', 'Urgenza'];

// Intervalli orari selezionabili (minuti)
export const INTERVALLI = [10, 15, 20, 25, 30];

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
