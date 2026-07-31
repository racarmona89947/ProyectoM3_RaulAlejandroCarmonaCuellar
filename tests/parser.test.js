import { describe, expect, it } from 'vitest';
import { normalizeGeminiResponse } from '../src/utils.js';

describe('parser', () => {
  it('lee el texto anidado de una respuesta de Gemini', () => {
    const raw = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Soy Homer.' }]
          }
        }
      ]
    };

    expect(normalizeGeminiResponse(raw)).toBe('Soy Homer.');
  });

  it('acepta respuestas simplificadas con answer', () => {
    expect(normalizeGeminiResponse({ answer: '  OK  ' })).toBe('OK');
  });
});
