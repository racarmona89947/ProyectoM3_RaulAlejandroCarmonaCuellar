export const STORAGE_KEYS = {
  history: 'simpsons-chat-history',
  theme: 'theme',
  selectedCharacter: 'simpsons-selected-character'
};

export function getHistoryKey(characterId) {
  return `${STORAGE_KEYS.history}-${Number(characterId)}`;
}

export function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatTimestamp(dateValue = new Date()) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function loadJson(key, fallbackValue) {
  if (typeof localStorage === 'undefined') {
    return fallbackValue;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function saveJson(key, value) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStoredValue(key) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(key);
}

export function setTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }

  saveJson(STORAGE_KEYS.theme, theme);
}

export function getTheme() {
  return loadJson(STORAGE_KEYS.theme, 'light');
}

export function toggleTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function createMessage({ role, content, characterId = null, characterName = '', timestamp = new Date().toISOString() }) {
  return {
    id: createId(),
    role,
    content,
    characterId,
    characterName,
    timestamp
  };
}

export function appendMessage(messages, message) {
  return [...messages, message];
}

export function trimHistory(messages, maxMessages = 12) {
  return messages.slice(-maxMessages);
}

export function normalizeGeminiResponse(rawResponse) {
  if (typeof rawResponse?.answer === 'string') {
    return rawResponse.answer.trim().replace(/\s+/g, ' ');
  }

  if (typeof rawResponse?.choices?.[0]?.message?.content === 'string') {
    return rawResponse.choices[0].message.content.trim().replace(/\s+/g, ' ');
  }

  if (typeof rawResponse?.text === 'string') {
    return rawResponse.text.trim().replace(/\s+/g, ' ');
  }

  const candidates = Array.isArray(rawResponse?.candidates) ? rawResponse.candidates : [];
  const text = candidates
    .flatMap((candidate) => candidate?.content?.parts ?? [])
    .filter((part) => typeof part?.text === 'string')
    .map((part) => part.text)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!text) {
    throw new Error('La respuesta de la IA no incluyó texto utilizable.');
  }

  return text;
}

export function transformCharacter(rawCharacter) {
  const portrait = rawCharacter?.portrait_path ? `https://thesimpsonsapi.com${rawCharacter.portrait_path}` : '';
  const descriptionParts = [rawCharacter?.occupation, rawCharacter?.status ? `Estado: ${rawCharacter.status}` : '']
    .filter(Boolean);

  return {
    id: Number(rawCharacter?.id ?? 0),
    name: rawCharacter?.name ?? 'Desconocido',
    image: portrait,
    description: descriptionParts.join(' · ') || 'Personaje de Springfield'
  };
}
