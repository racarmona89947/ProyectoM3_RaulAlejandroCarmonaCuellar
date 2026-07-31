export function renderNavbar({ currentPath, theme }) {
  const links = [
    { href: '/home', label: 'Inicio' },
    { href: '/chat', label: 'Chat' },
    { href: '/about', label: 'Acerca del proyecto' }
  ];

  return `
    <header class="topbar">
      <a class="brand" href="/home" data-link>
        <img class="brand__mark brand__mark--img" src="/api/character-image?id=1" alt="Homer Simpson" />
        <span class="brand__copy">
          <strong>Simpsons Chat</strong>
        </span>
      </a>

      <nav class="topbar__nav" aria-label="Navegación principal">
        ${links
          .map(
            (link) => `
              <a
                class="topbar__link ${currentPath === link.href ? 'is-active' : ''}"
                href="${link.href}"
                data-link
              >
                ${link.label}
              </a>
            `
          )
          .join('')}
      </nav>

      <div class="topbar__actions">
        <button class="theme-toggle" type="button" data-theme-toggle>
          ${theme === 'dark' ? 'Claro' : 'Oscuro'}
        </button>
      </div>
    </header>
  `;
}
