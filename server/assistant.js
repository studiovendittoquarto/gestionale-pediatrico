// ============================================================
//  Router dell'Assistente AI — TUTTO sotto /api/assistant
//  Isolato dal gestionale: non tocca bookings/specialisti.
//  Le foto NON vengono mai salvate (analisi effimera).
// ============================================================
const express = require('express');
const ai = require('./ai-provider');

const router = express.Router();

// Disclaimer mostrato sempre col risultato (supporto NON vincolante)
const DISCLAIMER =
  'Strumento di SUPPORTO alla consultazione, non un dispositivo medico. ' +
  'Le indicazioni non sostituiscono il giudizio clinico del medico, che resta ' +
  'l’unico responsabile della decisione. Non inserire dati identificativi del paziente.';

const SYSTEM_PROMPT =
  'Sei un assistente di supporto alla consultazione per medici pediatri in Italia. ' +
  'NON sei un dispositivo medico e NON fornisci diagnosi definitive. ' +
  'Offri informazioni di supporto chiare, prudenti e non vincolanti, citando quando ' +
  'possibile linee guida o fonti riconosciute (es. SIP, OMS, AIFA). ' +
  'Ricorda sempre che la decisione clinica spetta al medico. ' +
  'Se i dati sono insufficienti, fai domande mirate per raccoglierli. ' +
  'Rispondi in italiano, in modo conciso e strutturato.';

// Stato/configurazione (per mostrare nel widget se l'AI è attiva)
router.get('/status', (req, res) => {
  res.json({ ...ai.status(), disclaimer: DISCLAIMER });
});

// Domanda testuale
router.post('/chat', async (req, res) => {
  const prompt = (req.body?.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'Domanda mancante' });
  try {
    const reply = await ai.ask({ system: SYSTEM_PROMPT, prompt });
    res.json({ reply, disclaimer: DISCLAIMER });
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

// Domanda con foto (effimera: l'immagine non viene salvata)
router.post('/vision', async (req, res) => {
  const prompt = (req.body?.prompt || 'Descrivi cosa osservi in questa immagine.').trim();
  const image = req.body?.image; // { mimeType, data(base64) }
  if (!image?.data || !image?.mimeType)
    return res.status(400).json({ error: 'Immagine mancante' });
  try {
    const reply = await ai.ask({ system: SYSTEM_PROMPT, prompt, image });
    res.json({ reply, disclaimer: DISCLAIMER });
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

module.exports = router;
