import { config } from '../config.js';
function extractId(url) {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : 0;
}
export async function fetchCharacters(page = 1, search) {
    const params = new URLSearchParams({ page: String(page) });
    if (search?.trim()) {
        params.set('search', search.trim());
    }
    const res = await fetch(`${config.swapiBaseUrl}/people?${params}`);
    if (!res.ok) {
        throw new Error(`SWAPI error: ${res.status}`);
    }
    const data = (await res.json());
    return {
        count: data.count,
        next: data.next ? page + 1 : null,
        previous: data.previous ? page - 1 : null,
        results: data.results.map((c) => ({ ...c, id: extractId(c.url) })),
    };
}
export async function fetchCharacter(id) {
    const res = await fetch(`${config.swapiBaseUrl}/people/${id}/`);
    if (res.status === 404) {
        throw new Error('NOT_FOUND');
    }
    if (!res.ok) {
        throw new Error(`SWAPI error: ${res.status}`);
    }
    const data = (await res.json());
    return { ...data, id };
}
export function toCharacterSnapshot(character) {
    return {
        name: character.name,
        height: character.height,
        mass: character.mass,
        hair_color: character.hair_color,
        skin_color: character.skin_color,
        eye_color: character.eye_color,
        birth_year: character.birth_year,
        gender: character.gender,
        homeworld: character.homeworld,
        films: character.films,
    };
}
