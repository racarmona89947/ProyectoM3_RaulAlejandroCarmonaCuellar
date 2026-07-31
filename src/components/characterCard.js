export function renderCharacterCard(character, isSelected = false) {
  return `
    <article class="character-card ${isSelected ? 'is-selected' : ''}" style="--accent:${character.accent};">
      <div class="character-card__image-wrap">
        <img class="character-card__image" src="${character.image}" alt="${character.name}" loading="lazy" data-fallback-src="${character.fallbackImage}" />
      </div>
      <div class="character-card__body">
        <p class="character-card__tagline">${character.tagline}</p>
        <h3>${character.name}</h3>
        <p class="character-card__description">${character.description}</p>
        <button class="character-card__cta" type="button" data-select-character="${character.id}">Chatear</button>
      </div>
    </article>
  `;
}
