import { describe, expect, it } from 'vitest';
import { appendMessage, createMessage, trimHistory } from '../src/utils.js';

describe('chat helpers', () => {
  it('agrega mensajes del usuario y asistente en orden', () => {
    const user = createMessage({ role: 'user', content: 'Hola Homer' });
    const assistant = createMessage({ role: 'assistant', content: 'Doh!', characterName: 'Homer Simpson' });

    const history = appendMessage(appendMessage([], user), assistant);

    expect(history.map((message) => message.role)).toEqual(['user', 'assistant']);
  });

  it('mantiene solo el historial reciente para la IA', () => {
    const history = Array.from({ length: 10 }, (_, index) => createMessage({ role: 'user', content: `Mensaje ${index + 1}` }));

    expect(trimHistory(history, 3)).toHaveLength(3);
  });
});
