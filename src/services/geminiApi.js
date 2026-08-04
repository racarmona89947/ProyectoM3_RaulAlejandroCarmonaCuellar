import { formatSimpsonsErrorText, normalizeGeminiResponse } from '../utils.js';

export async function sendChatToApi({ characterId, messages }) {
  let response;

  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ characterId, messages })
    });
  } catch {
    throw new Error(formatSimpsonsErrorText('api-network'));
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? formatSimpsonsErrorText('api-response', `HTTP ${response.status}`));
  }

  return normalizeGeminiResponse(data);
}
