// ============================================================
//  AI Provider Adapter — "cervello" a innesto, intercambiabile
//  Sceglie il provider in base alle chiavi presenti nell'ambiente.
//  Nessuna chiave = assistente non configurato (il resto del
//  portale e il gestionale continuano a funzionare lo stesso).
//
//  Provider supportati:
//   - Google Gemini  (GEMINI_API_KEY)   -> piano gratuito, con visione
//   - Anthropic Claude (ANTHROPIC_API_KEY) -> a pagamento, qualità top + visione
//   - Groq (GROQ_API_KEY)               -> gratuito, SOLO testo (no foto)
//
//  Override manuale con AI_PROVIDER = gemini | claude | groq
// ============================================================

function pickProvider() {
  const forced = (process.env.AI_PROVIDER || '').toLowerCase();
  if (forced) return forced;
  if (process.env.ANTHROPIC_API_KEY) return 'claude';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY) return 'groq';
  return 'none';
}

function status() {
  const provider = pickProvider();
  const supportsVision = provider === 'gemini' || provider === 'claude';
  return { configured: provider !== 'none', provider, supportsVision };
}

// --------- Google Gemini (piano gratuito) ---------
async function gemini({ system, prompt, image }) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const parts = [{ text: `${system}\n\n---\n\nRichiesta del medico:\n${prompt}` }];
  if (image) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Errore Gemini');
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '(nessuna risposta)';
}

// --------- Anthropic Claude ---------
async function claude({ system, prompt, image }) {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
  const content = [{ type: 'text', text: prompt }];
  if (image) {
    content.unshift({
      type: 'image',
      source: { type: 'base64', media_type: image.mimeType, data: image.data },
    });
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Errore Claude');
  return data?.content?.map((c) => c.text).filter(Boolean).join('') || '(nessuna risposta)';
}

// --------- Groq (solo testo, gratuito) ---------
async function groq({ system, prompt }) {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Errore Groq');
  return data?.choices?.[0]?.message?.content || '(nessuna risposta)';
}

// --------- Funzione unica usata dal resto del backend ---------
async function ask({ system, prompt, image }) {
  const provider = pickProvider();
  if (provider === 'none') {
    throw new Error('Assistente AI non configurato (manca una chiave API).');
  }
  if (image && provider === 'groq') {
    throw new Error('Il provider attuale (Groq) non supporta le immagini.');
  }
  if (provider === 'claude') return claude({ system, prompt, image });
  if (provider === 'gemini') return gemini({ system, prompt, image });
  if (provider === 'groq') return groq({ system, prompt });
  throw new Error('Provider AI sconosciuto: ' + provider);
}

module.exports = { ask, status };
