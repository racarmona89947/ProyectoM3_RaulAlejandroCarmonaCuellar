import { renderSimpsonsErrorState } from '../utils.js';

export function renderChatView({ character, messages = [], loading = false, error = null, hasSavedHistory = false }) {
  return `
    <section class="chat-layout panel">
      <header class="chat-hero" style="--accent:${character.accent};">
        <img class="chat-hero__avatar" src="${character.image}" alt="${character.name}" data-fallback-src="${character.fallbackImage}" />
        <div>
          <p class="eyebrow">Chat en sesión</p>
          <h1>${character.name}</h1>
          <p class="chat-hero__copy">${character.description}</p>
        </div>
        <div class="chat-hero__badges">
          <span class="badge ${hasSavedHistory ? 'badge--saved' : 'badge--idle'}">${hasSavedHistory ? 'Historial guardado' : 'Sin historial guardado'}</span>
          <button class="button button--ghost button--compact" type="button" data-clear-history>Limpiar historial</button>
        </div>
      </header>

      <div class="chat-status" data-chat-status>
        ${error ? renderSimpsonsErrorState({ type: 'chat-send', detail: error }) : ''}
      </div>

      <div class="chat-panel">
        <div class="chat-panel__messages" data-message-list>
          ${messages.length ? '' : `<div class="empty-state"><strong>Empieza la conversación.</strong><p>Escribe un mensaje y el personaje responderá aquí.</p></div>`}
        </div>

        <form class="chat-form" data-chat-form>
          <label class="sr-only" for="chat-input">Escribe tu mensaje</label>
          <textarea id="chat-input" name="message" rows="2" placeholder="Escribe aquí..." data-chat-input></textarea>
          <div class="chat-form__actions">
            <p class="chat-form__hint">Enter envía. Shift + Enter crea una nueva línea.</p>
            <button class="button button--primary" type="submit" data-send-message ${loading ? 'disabled' : ''}>${loading ? 'Enviando...' : 'Enviar'}</button>
          </div>
        </form>
      </div>
    </section>
  `;
}
