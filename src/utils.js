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
    throw new Error(formatSimpsonsErrorText('ai-empty'));
  }

  return text;
}

export function getSimpsonsErrorCopy(type = 'generic') {
  const copyByType = {
    'not-found': {
      title: '404 - Ruta perdida en Springfield',
      message: 'Bart movio el letrero de esta calle. Esta ruta no existe en la ciudad.'
    },
    'characters-load': {
      title: 'No llegaron los vecinos de Springfield',
      message: 'El bus escolar se retraso y no pudimos cargar personajes por ahora.'
    },
    'chat-send': {
      title: 'D\'oh. El mensaje no despego',
      message: 'La taberna de Moe tiene mala senal y el chat no pudo enviar tu mensaje.'
    },
    'api-response': {
      title: 'Krusty corto la transmision',
      message: 'La respuesta del servidor no llego como esperabamos.'
    },
    'api-network': {
      title: 'La red de Springfield esta caida',
      message: 'No hubo conexion. Revisa internet e intentalo nuevamente.'
    },
    'ai-empty': {
      title: 'La IA se quedo sin guion',
      message: 'Gemini respondio sin texto utilizable para continuar la escena.'
    },
    'api-method': {
      title: 'Metodo no permitido por el jefe Wiggum',
      message: 'Este endpoint solo acepta solicitudes POST.'
    },
    'api-config': {
      title: 'La planta nuclear quedo sin energia',
      message: 'Falta configurar GEMINI_API_KEY en el servidor.'
    },
    'api-request': {
      title: 'Peticion incompleta en la oficina de correos',
      message: 'Debes enviar characterId y messages para iniciar el chat.'
    },
    'api-internal': {
      title: 'Exploto algo en el sotano del Sr. Burns',
      message: 'Ocurrio un error interno del servidor. Intenta de nuevo en unos segundos.'
    },
    generic: {
      title: 'D\'oh. Algo salio mal',
      message: 'Se produjo un error inesperado en Springfield.'
    }
  };

  return copyByType[type] ?? copyByType.generic;
}

export function formatSimpsonsErrorText(type = 'generic', detail = '') {
  const copy = getSimpsonsErrorCopy(type);
  const normalizedDetail = String(detail || '').trim();

  if (!normalizedDetail) {
    return `${copy.title}. ${copy.message}`;
  }

  return `${copy.title}. ${copy.message} Detalle tecnico: ${normalizedDetail}`;
}

export function renderSimpsonsErrorState({ type = 'generic', detail = '', actionMarkup = '' } = {}) {
  const copy = getSimpsonsErrorCopy(type);
  const normalizedDetail = String(detail || '').trim();

  return `
    <div class="state-box state-box--error state-box--simpsons-error" role="alert" aria-live="polite">
      <div class="state-box__header">
        <span class="state-box__chip">Springfield Alert</span>
        <strong>${escapeHtml(copy.title)}</strong>
      </div>
      <p class="state-box__message">${escapeHtml(copy.message)}</p>
      ${normalizedDetail ? `<p class="state-box__detail">Pista tecnica: ${escapeHtml(normalizedDetail)}</p>` : ''}
      ${actionMarkup}
    </div>
  `;
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
