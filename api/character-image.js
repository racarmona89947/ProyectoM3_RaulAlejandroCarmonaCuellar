const SIMPSONS_API_BASE = 'https://thesimpsonsapi.com/api';
const SIMPSONS_IMAGE_CDN = 'https://cdn.thesimpsonsapi.com/500/character';

async function fetchCharacterImage(id) {
  const directImageResponse = await fetch(`${SIMPSONS_IMAGE_CDN}/${id}.webp`);

  if (directImageResponse.ok) {
    return directImageResponse;
  }

  const characterResponse = await fetch(`${SIMPSONS_API_BASE}/characters/${id}`);

  if (!characterResponse.ok) {
    throw new Error(`No se pudo cargar el personaje ${id}.`);
  }

  const character = await characterResponse.json();
  const portraitPath = character?.portrait_path;

  if (!portraitPath) {
    throw new Error('El personaje no tiene imagen disponible.');
  }

  const imageResponse = await fetch(`https://thesimpsonsapi.com${portraitPath}`);

  if (!imageResponse.ok) {
    throw new Error('No se pudo descargar la imagen del personaje.');
  }

  return imageResponse;
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const url = new URL(request.url, 'http://localhost');
    const id = Number(url.searchParams.get('id'));

    if (!id) {
      response.status(400).json({ error: 'id es requerido.' });
      return;
    }

    const imageResponse = await fetchCharacterImage(id);
    const contentType = imageResponse.headers.get('content-type') || 'image/webp';
    const arrayBuffer = request.method === 'HEAD' ? null : await imageResponse.arrayBuffer();

    response.statusCode = 200;
    response.setHeader('Content-Type', contentType);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    response.end(Buffer.from(arrayBuffer));
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor.' });
  }
}const SIMPSONS_API_BASE = 'https://thesimpsonsapi.com/api';
const SIMPSONS_IMAGE_CDN = 'https://cdn.thesimpsonsapi.com/500/character';

async function fetchCharacterImage(id) {
  const directImageResponse = await fetch(`${SIMPSONS_IMAGE_CDN}/${id}.webp`);

  if (directImageResponse.ok) {
    return directImageResponse;
  }

  const characterResponse = await fetch(`${SIMPSONS_API_BASE}/characters/${id}`);

  if (!characterResponse.ok) {
    throw new Error(`No se pudo cargar el personaje ${id}.`);
  }

  const character = await characterResponse.json();
  const portraitPath = character?.portrait_path;

  if (!portraitPath) {
    throw new Error('El personaje no tiene imagen disponible.');
  }

  const imageResponse = await fetch(`https://thesimpsonsapi.com${portraitPath}`);

  if (!imageResponse.ok) {
    throw new Error('No se pudo descargar la imagen del personaje.');
  }

  return imageResponse;
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const url = new URL(request.url, 'http://localhost');
    const id = Number(url.searchParams.get('id'));

    if (!id) {
      response.status(400).json({ error: 'id es requerido.' });
      return;
    }

    const imageResponse = await fetchCharacterImage(id);
    const contentType = imageResponse.headers.get('content-type') || 'image/webp';
    const arrayBuffer = request.method === 'HEAD' ? null : await imageResponse.arrayBuffer();

    response.statusCode = 200;
    response.setHeader('Content-Type', contentType);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    response.end(Buffer.from(arrayBuffer));
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Error interno del servidor.' });
  }
}