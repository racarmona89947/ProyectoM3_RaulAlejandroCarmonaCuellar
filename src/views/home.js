import { renderCharacterCard } from '../components/characterCard.js';
import { renderSimpsonsErrorState } from '../utils.js';

function renderSkeletonCard() {
  return `
    <article class="character-card character-card--skeleton">
      <div class="character-card__image-wrap skeleton-box"></div>
      <div class="character-card__body">
        <div class="skeleton-line skeleton-line--small"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line--wide"></div>
        <div class="skeleton-button"></div>
      </div>
    </article>
  `;
}

export function renderHome({ characters = [], loading = false, error = null, selectedCharacterId = 1 }) {
  return `
    <section class="hero hero--compact panel">
      <h1>Chatea con tu personaje favorito de Springfield</h1>
      <div class="hero__actions">
        <a class="button button--primary" href="/chat" data-link data-route-chat="${selectedCharacterId}">Empezar a chatear</a>
        <a class="button button--ghost" href="/about" data-link>Conocer el proyecto</a>
      </div>

      ${error
    ? renderSimpsonsErrorState({
      type: 'characters-load',
      detail: error,
      actionMarkup: '<button class="button button--ghost" type="button" data-retry-characters>Reintentar</button>'
    })
    : ''}

      <div class="character-grid ${loading ? 'character-grid--loading' : ''}">
        ${loading && !characters.length ? Array.from({ length: 7 }, renderSkeletonCard).join('') : characters.map((character) => renderCharacterCard(character, Number(character.id) === Number(selectedCharacterId))).join('')}
      </div>
    </section>
  `;
}
