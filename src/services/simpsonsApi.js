import { enrichCharacter } from '../characters.js';

const API_BASE_URL = 'https://thesimpsonsapi.com/api';

export async function fetchCharacterById(id) {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar el personaje ${id}.`);
  }

  const rawCharacter = await response.json();
  return enrichCharacter(rawCharacter);
}

export async function fetchCharacters() {
  return Promise.all([1, 2, 3, 4, 5, 9, 13].map((id) => fetchCharacterById(id)));
}
