import { GoogleGenAI } from '@google/genai';
import { getCharacterPrompt, getCharacterMeta } from '../src/characters.js';
import { formatSimpsonsErrorText, normalizeGeminiResponse } from '../src/utils.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_MAX_TOKENS = Number(process.env.GEMINI_MAX_TOKENS ?? 700);
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE ?? 0.4);

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
    });

    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function mapMessages(messages = []) {
  return messages
    .filter((message) => typeof message?.content === 'string' && message.content.trim())
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      content: message.content.trim()
    }));
}

function looksIncomplete(text) {
  const normalizedText = String(text || '').trim();

  if (normalizedText.length < 60) {
    return true;
  }

  if (!/[.!?…]$/.test(normalizedText)) {
    return true;
  }

  return false;
}

function createClient(apiKey) {
  return new GoogleGenAI({ apiKey });
}

function buildGeminiContents(messages) {
  return [
    ...messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }]
    }))
  ];
}

async function generateGeminiResponse(client, character, messages) {
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildGeminiContents(messages),
    config: {
      temperature: GEMINI_TEMPERATURE,
      maxOutputTokens: GEMINI_MAX_TOKENS,
      systemInstruction: getCharacterPrompt(character)
    }
  });

  return response;
}

async function continueIfTruncated(client, character, messages, data) {
  const finishReason = String(data?.candidates?.[0]?.finishReason ?? data?.candidates?.[0]?.finish_reason ?? '').toUpperCase();

  const partialText = normalizeGeminiResponse(data);
  const shouldContinue = finishReason === 'MAX_TOKENS' || looksIncomplete(partialText);

  if (!shouldContinue) {
    return data;
  }

  const continuationMessages = [
    ...messages,
    {
      role: 'model',
      content: partialText
    },
    {
      role: 'user',
      content: 'Continúa exactamente desde la última frase, sin repetir lo anterior y cerrando la idea completa.'
    }
  ];

  return generateGeminiResponse(client, character, continuationMessages);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: formatSimpsonsErrorText('api-method') });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    response.status(500).json({ error: formatSimpsonsErrorText('api-config') });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const characterId = Number(body.characterId);
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const character = getCharacterMeta(characterId);

    if (!characterId || !messages.length) {
      response.status(400).json({ error: formatSimpsonsErrorText('api-request') });
      return;
    }

    const client = createClient(apiKey);
    const mappedMessages = mapMessages(messages);
    const data = await generateGeminiResponse(client, character, mappedMessages);
    const completeData = await continueIfTruncated(client, character, mappedMessages, data);
    const answer = normalizeGeminiResponse(completeData);
    response.status(200).json({ answer });
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    response.status(500).json({ error: formatSimpsonsErrorText('api-internal', detail) });
  }
}
