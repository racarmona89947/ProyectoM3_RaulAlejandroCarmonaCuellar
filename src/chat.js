import { sendChatToApi } from './services/geminiApi.js';
import { createMessage, appendMessage, loadJson, saveJson, removeStoredValue, trimHistory, getHistoryKey, renderSimpsonsErrorState } from './utils.js';
import { renderMessageBubble } from './components/messageBubble.js';
import { renderTypingIndicator } from './components/typingIndicator.js';

export function createChatSession() {
  const state = {
    root: null,
    character: null,
    messages: [],
    isLoading: false,
    error: null
  };

  let elements = {};

  function getCurrentHistoryKey() {
    return state.character ? getHistoryKey(state.character.id) : getHistoryKey(1);
  }

  function loadCharacterHistory(characterId) {
    const persistedHistory = loadJson(getHistoryKey(characterId), []);
    state.messages = Array.isArray(persistedHistory) ? persistedHistory : [];
  }

  function persist() {
    saveJson(getCurrentHistoryKey(), state.messages);
  }

  function getHasHistory() {
    return state.messages.length > 0;
  }

  function renderMessages() {
    if (!elements.messageList) {
      return;
    }

    const messageMarkup = state.messages.map((message) => renderMessageBubble(message)).join('');
    const typingMarkup = state.isLoading ? renderTypingIndicator(state.character?.chatName ?? state.character?.name ?? 'El personaje') : '';
    const emptyMarkup = !state.messages.length && !state.isLoading ? `<div class="empty-state"><strong>Empieza la conversación.</strong><p>Escribe un mensaje y el personaje responderá aquí.</p></div>` : '';

    elements.messageList.innerHTML = `${emptyMarkup}${messageMarkup}${typingMarkup}`;
    elements.messageList.scrollTop = elements.messageList.scrollHeight;
  }

  function setStatusError(message) {
    if (elements.status) {
      elements.status.innerHTML = message ? renderSimpsonsErrorState({ type: 'chat-send', detail: message }) : '';
    }
  }

  function renderShell() {
    if (!state.root || !state.character) {
      return;
    }

    state.root.innerHTML = `
      <section class="chat-layout panel">
        <header class="chat-hero" style="--accent:${state.character.accent};">
          <img class="chat-hero__avatar" src="${state.character.image}" alt="${state.character.name}" data-fallback-src="${state.character.fallbackImage}" />
          <div class="chat-hero__main">
            <h1 class="chat-hero__name">${state.character.chatName ?? state.character.name}</h1>
          </div>
          <div class="chat-hero__actions">
            <span class="badge ${getHasHistory() ? 'badge--saved' : 'badge--idle'}">${getHasHistory() ? 'Guardado' : 'Sin guardar'}</span>
            <button class="button button--ghost button--compact" type="button" data-clear-history>Limpiar historial</button>
          </div>
        </header>

        <div class="chat-status" data-chat-status></div>

        <div class="chat-panel">
          <div class="chat-panel__messages" data-message-list></div>

          <form class="chat-form" data-chat-form>
            <label class="sr-only" for="chat-input">Escribe tu mensaje</label>
            <textarea id="chat-input" name="message" rows="1" placeholder="Escribe aquí... Enter envía. Shift + Enter crea una nueva línea." data-chat-input></textarea>
            <button class="button button--primary" type="submit" data-send-message ${state.isLoading ? 'disabled' : ''}>${state.isLoading ? 'Enviando...' : 'Enviar'}</button>
          </form>
        </div>
      </section>
    `;

    elements = {
      form: state.root.querySelector('[data-chat-form]'),
      input: state.root.querySelector('[data-chat-input]'),
      messageList: state.root.querySelector('[data-message-list]'),
      status: state.root.querySelector('[data-chat-status]'),
      clearHistoryButton: state.root.querySelector('[data-clear-history]'),
      sendButton: state.root.querySelector('[data-send-message]')
    };

    attachEvents();
    setupImageFallbacks();
    setStatusError(state.error);
    renderMessages();
    if (elements.input) {
      elements.input.focus();
    }
  }

  function attachEvents() {
    elements.form?.addEventListener('submit', handleSubmit);
    elements.clearHistoryButton?.addEventListener('click', handleClearHistory);
    elements.messageList?.addEventListener('click', handleCopyMessage);
    elements.input?.addEventListener('keydown', handleEnterToSend);
  }

  function detachEvents() {
    elements.form?.removeEventListener('submit', handleSubmit);
    elements.clearHistoryButton?.removeEventListener('click', handleClearHistory);
    elements.messageList?.removeEventListener('click', handleCopyMessage);
    elements.input?.removeEventListener('keydown', handleEnterToSend);
  }

  function setupImageFallbacks() {
    state.root?.querySelectorAll('img[data-fallback-src]').forEach((image) => {
      const applyFallback = () => {
        const fallbackSrc = image.getAttribute('data-fallback-src');

        if (fallbackSrc && image.src !== fallbackSrc) {
          image.src = fallbackSrc;
        }
      };

      image.onerror = applyFallback;

      if (image.complete && image.naturalWidth === 0) {
        applyFallback();
      }
    });
  }

  function handleEnterToSend(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      elements.form?.requestSubmit();
    }
  }

  function handleCopyMessage(event) {
    const copyButton = event.target.closest('[data-copy-message]');

    if (!copyButton) {
      return;
    }

    const messageId = copyButton.getAttribute('data-copy-message');
    const message = state.messages.find((item) => item.id === messageId);

    if (message?.content && navigator.clipboard) {
      navigator.clipboard.writeText(message.content).catch(() => {});
    }
  }

  function handleClearHistory() {
    state.messages = [];
    state.error = null;
    state.isLoading = false;
    removeStoredValue(getCurrentHistoryKey());
    renderShell();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const text = elements.input?.value.trim() ?? '';

    if (!text || state.isLoading) {
      return;
    }

    state.error = null;
    state.messages = appendMessage(state.messages, createMessage({ role: 'user', content: text }));
    state.isLoading = true;
    persist();
    renderMessages();

    if (elements.input) {
      elements.input.value = '';
    }

    try {
      const answer = await sendChatToApi({
        characterId: state.character.id,
        messages: trimHistory(state.messages, 8)
      });

      state.messages = appendMessage(
        state.messages,
          createMessage({
            role: 'assistant',
            content: answer,
            characterId: state.character.id,
            characterName: state.character.name,
            characterChatName: state.character.chatName ?? state.character.name
          })
      );
      persist();
      state.error = null;
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Error desconocido';
    } finally {
      state.isLoading = false;
      setStatusError(state.error);
      renderMessages();
    }
  }

  function mount(root, character) {
    state.root = root;
    state.character = character;
    loadCharacterHistory(character.id);
    state.error = null;
    renderShell();
  }

  function updateCharacter(character) {
    const previousCharacterId = state.character?.id;
    state.character = character;

    if (previousCharacterId !== character.id) {
      loadCharacterHistory(character.id);
    }

    if (state.root) {
      renderShell();
    }
  }

  function destroy() {
    detachEvents();
    state.root = null;
    elements = {};
  }

  return {
    mount,
    updateCharacter,
    destroy,
    get messages() {
      return state.messages;
    },
    get hasHistory() {
      return getHasHistory();
    }
  };
}
