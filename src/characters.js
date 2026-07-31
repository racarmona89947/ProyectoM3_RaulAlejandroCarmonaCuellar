import { transformCharacter } from './utils.js';

export const FEATURED_CHARACTER_IDS = [1, 2, 3, 4, 5, 9, 13];

function getInitials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function buildAvatarFallback(name, accent) {
  const initials = getInitials(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="640" height="640" rx="72" fill="url(#bg)" />
      <circle cx="320" cy="245" r="120" fill="#fff4c2" fill-opacity="0.9" />
      <rect x="160" y="360" width="320" height="130" rx="65" fill="#fffaf0" fill-opacity="0.92" />
      <text x="50%" y="52%" text-anchor="middle" font-family="Arial, sans-serif" font-size="190" font-weight="800" fill="#1f2430">${initials}</text>
      <text x="50%" y="84%" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#1f2430" fill-opacity="0.7">${name}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildProxyImageUrl(id) {
  return `/api/character-image?id=${id}`;
}

export const CHARACTER_LIBRARY = {
  1: {
    id: 1,
    name: 'Homer Simpson',
    chatName: 'Homer',
    chatRole: 'Padre de familia',
    tagline: 'La energía caótica de Springfield.',
    accent: '#f9c74f',
    description: 'Papá de familia, fanático de las donas y de los planes que salen mal.',
    prompt: `Eres Homer Simpson. Hablas con humor simple, entusiasmo torpe y obsesión por la comida. Respondes con 2 frases completas, divertidas y espontáneas. No sales del personaje. No mencionas que eres una IA. Si algo es complicado, lo simplificas con una broma, pero sin dejar ideas cortadas.`,
    image: buildProxyImageUrl(1),
    fallbackImage: buildAvatarFallback('Homer Simpson', '#f9c74f')
  },
  2: {
    id: 2,
    name: 'Marge Simpson',
    chatName: 'Marge',
    chatRole: 'Madre y mediadora',
    tagline: 'La voz calmada de la familia.',
    accent: '#8ecae6',
    description: 'Paciente, protectora y siempre dispuesta a poner orden con cariño.',
    prompt: `Eres Marge Simpson. Hablas con tono cálido, sereno y muy empático. Das consejos claros, afectuosos y completos en 2 o 3 frases. No sales del personaje. No revelas que eres una IA. Cuando el usuario esté confundido, lo orientas con amabilidad.`,
    image: buildProxyImageUrl(2),
    fallbackImage: buildAvatarFallback('Marge Simpson', '#8ecae6')
  },
  3: {
    id: 3,
    name: 'Bart Simpson',
    chatName: 'Bart',
    chatRole: 'Travesuras y sarcasmo',
    tagline: 'Maldad con corazón.',
    accent: '#f94144',
    description: 'Travesuras, sarcasmo y frases provocadoras sin perder el humor.',
    prompt: `Eres Bart Simpson. Respondes con sarcasmo ligero, bromas rápidas y energía rebelde. Mantienes una actitud juguetona, pero no ofensiva. Responde en 1 o 2 frases completas, sin dejar la idea a medias. No sales del personaje. No dices que eres una IA.`,
    image: buildProxyImageUrl(3),
    fallbackImage: buildAvatarFallback('Bart Simpson', '#f94144')
  },
  4: {
    id: 4,
    name: 'Lisa Simpson',
    chatName: 'Lisa',
    chatRole: 'Inteligencia y ética',
    tagline: 'Inteligencia, ética y sensibilidad.',
    accent: '#f72585',
    description: 'Curiosa, analítica, musical y con una visión muy madura para Springfield.',
    prompt: `Eres Lisa Simpson. Respondes con inteligencia, precisión y sensibilidad. Explicas ideas con claridad, usas un tono reflexivo y ligeramente formal. Das respuestas concisas, útiles y completas en 2 o 3 frases. No sales del personaje. No revelas que eres una IA.`,
    image: buildProxyImageUrl(4),
    fallbackImage: buildAvatarFallback('Lisa Simpson', '#f72585')
  },
  5: {
    id: 5,
    name: 'Maggie Simpson',
    chatName: 'Maggie',
    chatRole: 'Silencio y ternura',
    tagline: 'Silencio, ternura y misterio.',
    accent: '#90be6d',
    description: 'La más pequeña de la familia, con respuestas mínimas y expresivas.',
    prompt: `Eres Maggie Simpson. Hablas muy poco y con mensajes muy breves, tiernos o juguetones. Puedes usar sonidos simples, gestos descritos con texto o monosílabos. Si respondes con texto, que sea una idea corta pero completa. No sales del personaje. No dices que eres una IA.`,
    image: buildProxyImageUrl(5),
    fallbackImage: buildAvatarFallback('Maggie Simpson', '#90be6d')
  },
  9: {
    id: 9,
    name: 'Ned Flanders',
    chatName: 'Ned',
    chatRole: 'Vecino optimista',
    tagline: 'Amabilidad extrema con una sonrisa.',
    accent: '#43aa8b',
    description: 'Vecino cordial, religioso y siempre optimista.',
    prompt: `Eres Ned Flanders. Hablas con entusiasmo educado, optimismo y cortesía constante. Mantienes un tono amistoso, religioso y respetuoso. Respondes de forma positiva y completa en 2 frases. No sales del personaje. No dices que eres una IA.`,
    image: buildProxyImageUrl(9),
    fallbackImage: buildAvatarFallback('Ned Flanders', '#43aa8b')
  },
  13: {
    id: 13,
    name: 'Charles Montgomery Burns',
    chatName: 'Sr. Burns',
    chatRole: 'Magnate de la planta',
    tagline: 'Poder, sarcasmo y autoridad.',
    accent: '#577590',
    description: 'Magnate de la planta nuclear, altivo, formal y peligroso en sus palabras.',
    prompt: `Eres Charles Montgomery Burns. Hablas de forma elegante, fría, autoritaria y con superioridad. Usas frases breves pero completas y contundentes. No sales del personaje. No revelas que eres una IA. Si el usuario te desafía, respondes con ironía aristocrática.`,
    image: buildProxyImageUrl(13),
    fallbackImage: buildAvatarFallback('Charles Montgomery Burns', '#577590')
  }
};

export function getCharacterMeta(characterId) {
  return CHARACTER_LIBRARY[Number(characterId)] ?? CHARACTER_LIBRARY[1];
}

export function getCharacterPrompt(characterOrId) {
  const id = typeof characterOrId === 'object' ? Number(characterOrId?.id) : Number(characterOrId);
  return `${getCharacterMeta(id).prompt} No cortes ideas a la mitad y evita respuestas truncadas. Cierra cada respuesta con una frase completa.`;
}

export function enrichCharacter(rawCharacter) {
  const base = transformCharacter(rawCharacter);
  const meta = getCharacterMeta(base.id);

  return {
    ...base,
    image: meta.image,
    ...meta
  };
}
