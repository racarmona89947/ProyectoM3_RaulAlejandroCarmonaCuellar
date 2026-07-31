import { normalizeGeminiResponse } from '../utils.js';

export async function sendChatToApi({ characterId, messages }) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ characterId, messages })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo obtener respuesta de Gemini.');
  }

  return normalizeGeminiResponse(data);
}
