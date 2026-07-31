// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNavigator, normalizePathname, resolveRoute } from '../src/router.js';

describe('router', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/home');
  });

  it('normaliza la ruta raíz', () => {
    expect(normalizePathname('/')).toBe('/home');
  });

  it('resuelve rutas conocidas y desconocidas', () => {
    expect(resolveRoute('/chat')).toBe('chat');
    expect(resolveRoute('/ruta-inexistente')).toBe('not-found');
  });

  it('navega sin recargar la página', () => {
    const onRender = vi.fn();
    const navigator = createNavigator(onRender);

    navigator.navigate('/about');

    expect(window.location.pathname).toBe('/about');
    expect(onRender).toHaveBeenCalledWith('about');
  });
});
