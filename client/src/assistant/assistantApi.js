// Chiamate all'assistente AI (sotto /api/assistant), con il token di login.
import { getToken } from '../api';

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Errore assistente');
  return data;
}

export const assistantApi = {
  status: () =>
    fetch('/api/assistant/status', { headers: { Authorization: 'Bearer ' + getToken() } })
      .then((r) => r.json())
      .catch(() => ({ configured: false })),
  chat: (prompt) => post('/api/assistant/chat', { prompt }),
  vision: (prompt, image) => post('/api/assistant/vision', { prompt, image }),
};

// Converte un File immagine in { mimeType, data(base64) } SENZA salvarlo da nessuna parte
export function fileToImagePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // data:<mime>;base64,xxxx
      const [, mimeType] = result.match(/^data:(.*?);base64,/) || [];
      const data = result.split(',')[1];
      resolve({ mimeType: mimeType || file.type || 'image/jpeg', data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
