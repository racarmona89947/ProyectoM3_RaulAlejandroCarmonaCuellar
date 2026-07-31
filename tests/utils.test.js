import { describe, expect, it } from 'vitest';
import { appendMessage, createMessage, normalizeGeminiResponse, trimHistory, transformCharacter } from '../src/utils.js';

describe('utils', () => {
  it('transforma un personaje crudo de The Simpsons API', () => {
    const character = transformCharacter({
      id: 1,
      name: 'Homer Simpson',
      portrait_path: '/character/1.webp',
      occupation: 'Safety Inspector',
      status: 'Alive'
    });

    expect(character).toEqual({
      id: 1,
      name: 'Homer Simpson',
      image: 'https://thesimpsonsapi.com/character/1.webp',
      description: 'Safety Inspector · Estado: Alive'
    });
  });

  it('crea mensajes y mantiene el historial inmutable', () => {
    const userMessage = createMessage({ role: 'user', content: 'Hola' });
    const nextHistory = appendMessage([], userMessage);

    expect(nextHistory).toHaveLength(1);
    expect(nextHistory[0].content).toBe('Hola');
  });

  it('recorta el historial a la cantidad solicitada', () => {
    const history = Array.from({ length: 5 }, (_, index) => ({ id: index + 1 }));

    expect(trimHistory(history, 2)).toEqual([{ id: 4 }, { id: 5 }]);
  });

  it('normaliza la respuesta de Gemini', () => {
    const answer = normalizeGeminiResponse({
      candidates: [
        {
          content: {
            parts: [{ text: 'Hola' }, { text: ' mundo' }]
          }
        }
      ]
    });

    expect(answer).toBe('Hola mundo');
  });
});
