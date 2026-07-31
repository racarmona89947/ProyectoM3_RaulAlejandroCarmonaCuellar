export function renderTypingIndicator(characterName = 'el personaje') {
  return `
    <div class="typing-indicator" role="status" aria-live="polite">
      <span></span>
      <span></span>
      <span></span>
      <strong>${characterName} está escribiendo...</strong>
    </div>
  `;
}
