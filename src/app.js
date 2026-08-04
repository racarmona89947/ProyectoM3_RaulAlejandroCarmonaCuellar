import { createNavigator, resolveRoute } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderHome } from './views/home.js';
import { renderAbout } from './views/about.js';
import { createChatSession } from './chat.js';
import { fetchCharacterById, fetchCharacters } from './services/simpsonsApi.js';
import { getCharacterMeta } from './characters.js';
import { formatSimpsonsErrorText, getTheme, loadJson, renderSimpsonsErrorState, saveJson, setTheme, toggleTheme, STORAGE_KEYS } from './utils.js';

const appRoot = document.querySelector('#app');
const chatSession = createChatSession();

const state = {
  route: resolveRoute(window.location.pathname),
  theme: getTheme(),
  selectedCharacterId: Number(loadJson(STORAGE_KEYS.selectedCharacter, 1)),
  characters: [],
  charactersLoading: false,
  charactersError: null
};

setTheme(state.theme);

const navigator = createNavigator(renderApp);

document.addEventListener('click', handleDocumentClick);

async function ensureCharactersLoaded() {
  if (state.characters.length || state.charactersLoading) {
    return;
  }

  state.charactersLoading = true;
  state.charactersError = null;
  renderApp();

  try {
    state.characters = await fetchCharacters();
  } catch (error) {
    state.charactersError = error instanceof Error ? error.message : formatSimpsonsErrorText('characters-load');
  } finally {
    state.charactersLoading = false;
    renderApp();
  }
}

async function getCharacterForChat(characterId) {
  const cachedCharacter = state.characters.find((character) => Number(character.id) === Number(characterId));

  if (cachedCharacter) {
    return cachedCharacter;
  }

  try {
    return await fetchCharacterById(characterId);
  } catch {
    return getCharacterMeta(characterId);
  }
}

function getRouteState() {
  return window.history.state ?? {};
}

function getSelectedCharacterId() {
  return Number(getRouteState().characterId ?? state.selectedCharacterId ?? 1);
}

function setSelectedCharacter(id) {
  state.selectedCharacterId = Number(id);
  saveJson(STORAGE_KEYS.selectedCharacter, state.selectedCharacterId);
}

function renderApp(routeName = resolveRoute(window.location.pathname)) {
  state.route = routeName;
  document.body.dataset.route = routeName;
  document.documentElement.dataset.theme = state.theme;

  if (!appRoot) {
    return;
  }

  const currentPath = routeName === 'home' ? '/home' : `/${routeName}`;
  const nav = renderNavbar({ currentPath, theme: state.theme });

  if (routeName !== 'chat') {
    chatSession.destroy();
  }

  let pageContent = '';

  if (routeName === 'home') {
    pageContent = renderHome({
      characters: state.characters,
      loading: state.charactersLoading,
      error: state.charactersError,
      selectedCharacterId: getSelectedCharacterId()
    });
  }

  if (routeName === 'about') {
    pageContent = renderAbout();
  }

  if (routeName === 'chat') {
    pageContent = '<section class="panel chat-placeholder"><div class="state-box"><strong>Cargando chat...</strong><p>Preparando el personaje y el historial.</p></div></section>';
  }

  if (routeName === 'not-found') {
    const requestedPath = window.location.pathname || '/';
    pageContent = `
      <section class="panel not-found-scene">
        <p class="eyebrow">404</p>
        ${renderSimpsonsErrorState({
          type: 'not-found',
          detail: `Ruta solicitada: ${requestedPath}`,
          actionMarkup: '<a class="button button--primary" href="/home" data-link>Volver al inicio</a>'
        })}
      </section>
    `;
  }

  appRoot.innerHTML = `${nav}<main class="page">${pageContent}</main>`;
  bindStaticInteractions();
  setupImageFallbacks(appRoot);

  if (routeName === 'chat') {
    initializeChatView();
  }
}

function setupImageFallbacks(root) {
  root.querySelectorAll('img[data-fallback-src]').forEach((image) => {
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

async function initializeChatView() {
  const characterId = getSelectedCharacterId();
  const character = await getCharacterForChat(characterId);
  const chatRoot = appRoot.querySelector('.page');

  if (!chatRoot) {
    return;
  }

  chatSession.mount(chatRoot, character);
}

function bindStaticInteractions() {
  const themeToggle = appRoot.querySelector('[data-theme-toggle]');
  const retryButton = appRoot.querySelector('[data-retry-characters]');
  const chatButton = appRoot.querySelector('[data-route-chat]');

  themeToggle?.addEventListener('click', handleThemeToggle);
  retryButton?.addEventListener('click', ensureCharactersLoaded);
  chatButton?.addEventListener('click', handleDirectChatStart);
}

function handleThemeToggle() {
  state.theme = toggleTheme(state.theme);
  setTheme(state.theme);
  renderApp();
}

function handleDirectChatStart(event) {
  const button = event.currentTarget;
  const characterId = Number(button?.getAttribute('data-route-chat') ?? state.selectedCharacterId);
  setSelectedCharacter(characterId);
  navigator.navigate('/chat', { state: { characterId } });
}

function handleDocumentClick(event) {
  const link = event.target.closest('a[data-link]');

  if (link) {
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isExternal = link.target === '_blank' || link.hostname !== window.location.hostname || link.protocol.startsWith('mailto') || link.protocol.startsWith('tel');

    if (!isModifiedClick && !isExternal) {
      event.preventDefault();
      navigator.navigate(link.getAttribute('href') ?? '/home', {
        state: getRouteState()
      });
    }

    return;
  }

  const characterButton = event.target.closest('[data-select-character]');

  if (characterButton) {
    const characterId = Number(characterButton.getAttribute('data-select-character'));
    setSelectedCharacter(characterId);
    navigator.navigate('/chat', { state: { characterId } });
  }
}

navigator.start();
ensureCharactersLoaded();
