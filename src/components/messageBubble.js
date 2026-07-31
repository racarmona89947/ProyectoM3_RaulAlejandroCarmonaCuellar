import { escapeHtml, formatTimestamp } from '../utils.js';

export function renderMessageBubble(message) {
  const isAssistant = message.role === 'assistant';
  const roleLabel = isAssistant ? message.characterChatName || message.characterName || 'Personaje' : 'Tú';

  return `
    <article class="message ${isAssistant ? 'message--assistant' : 'message--user'}" data-message-id="${message.id}">
      <header class="message__meta">
        <strong>${escapeHtml(roleLabel)}</strong>
        <time datetime="${message.timestamp}">${formatTimestamp(message.timestamp)}</time>
      </header>
      <div class="message__content">${escapeHtml(message.content)}</div>
      ${isAssistant ? `<button class="message__copy" type="button" data-copy-message="${message.id}">Copiar</button>` : ''}
    </article>
  `;
}
