export function normalizePathname(pathname = '/') {
  if (pathname === '/') {
    return '/home';
  }

  const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

  return normalized === '' ? '/home' : normalized;
}

export function resolveRoute(pathname = '/') {
  const path = normalizePathname(pathname);

  if (path === '/home' || path === '/') {
    return 'home';
  }

  if (path === '/chat') {
    return 'chat';
  }

  if (path === '/about') {
    return 'about';
  }

  return 'not-found';
}

export function createNavigator(onRender) {
  function render() {
    onRender(resolveRoute(window.location.pathname));
  }

  function navigate(pathname, options = {}) {
    const nextPath = normalizePathname(pathname);

    if (options.replace) {
      history.replaceState(options.state ?? null, '', nextPath);
    } else {
      history.pushState(options.state ?? null, '', nextPath);
    }

    render();
  }

  function start() {
    window.addEventListener('popstate', render);
    render();
  }

  return {
    navigate,
    start,
    render
  };
}
