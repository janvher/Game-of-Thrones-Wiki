import { config } from '../config.js';
import { HIDDEN_CHARACTER_NAMES } from '../data/popularCharacters.js';
import { deriveCharacterStatus, type CharacterStatus } from '../utils/characterStatus.js';
import { getCharacterImage, warmImageCache } from './characterImages.js';

export interface IceAndFireCharacter {
  url: string;
  name: string;
  gender: string;
  culture: string;
  born: string;
  died: string;
  alive: boolean | null;
  titles: string[];
  aliases: string[];
  father: string;
  mother: string;
  spouse: string[];
  allegiances: string[];
  books: string[];
  povBooks: string[];
  tvSeries: string[];
  playedBy: string[];
}

export interface CharacterListItem {
  id: number;
  name: string;
  gender: string;
  culture: string;
  born: string;
  titles: string[];
  tvSeries: string[];
  playedBy: string[];
  imageUrl?: string;
}

export interface CharacterDetail extends CharacterListItem {
  died: string;
  alive: boolean | null;
  status: CharacterStatus;
  aliases: string[];
  allegiances: string[];
  books: string[];
  povBooks: string[];
}

export function extractCharacterId(url: string): number {
  const match = url.match(/\/characters\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

async function apiFetch<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.iceAndFireBaseUrl}${path}`);
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : 'Network error';
    throw new Error(`Ice and Fire API unreachable: ${msg}`);
  }
  if (res.status === 404) {
    throw new Error('NOT_FOUND');
  }
  if (!res.ok) {
    throw new Error(`Ice and Fire API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function matchesSearch(c: IceAndFireCharacter, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    c.name?.toLowerCase().includes(lower) ||
    (c.aliases?.some((a) => a.toLowerCase().includes(lower)) ?? false)
  );
}

function isHiddenCharacter(name: string): boolean {
  const lower = name.toLowerCase();
  return HIDDEN_CHARACTER_NAMES.some((hidden) => lower.includes(hidden));
}

function toListItem(c: IceAndFireCharacter): CharacterListItem {
  return {
    id: extractCharacterId(c.url),
    name: c.name,
    gender: c.gender || 'Unknown',
    culture: c.culture || 'Unknown',
    born: c.born || 'Unknown',
    titles: c.titles?.filter(Boolean) ?? [],
    tvSeries: c.tvSeries ?? [],
    playedBy: c.playedBy ?? [],
    imageUrl: getCharacterImage(c.name),
  };
}

function filterBrowsable(characters: CharacterListItem[]): CharacterListItem[] {
  return characters.filter((c) => c.imageUrl && !isHiddenCharacter(c.name));
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

function preferCharacter(
  existing: CharacterListItem,
  candidate: CharacterListItem,
): CharacterListItem {
  const existingScore = existing.tvSeries.length;
  const candidateScore = candidate.tvSeries.length;
  if (candidateScore !== existingScore) {
    return candidateScore > existingScore ? candidate : existing;
  }
  return candidate.id > existing.id ? candidate : existing;
}

/** Last-line guard so API responses never contain duplicate cards on one page. */
export function dedupeCharacterList(items: CharacterListItem[]): CharacterListItem[] {
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const out: CharacterListItem[] = [];

  for (const item of items) {
    if (item.id > 0 && seenIds.has(item.id)) continue;
    const nameKey = normalizeName(item.name);
    if (seenNames.has(nameKey)) continue;
    if (item.id > 0) seenIds.add(item.id);
    seenNames.add(nameKey);
    out.push(item);
  }

  return out;
}

function appendUnique(
  pool: CharacterListItem[],
  seenIds: Set<number>,
  nameIndex: Map<string, number>,
  items: CharacterListItem[],
): void {
  for (const item of items) {
    if (item.id > 0 && seenIds.has(item.id)) continue;

    const nameKey = normalizeName(item.name);
    const existingIdx = nameIndex.get(nameKey);

    if (existingIdx !== undefined) {
      pool[existingIdx] = preferCharacter(pool[existingIdx], item);
      if (item.id > 0) seenIds.add(item.id);
      continue;
    }

    if (item.id > 0) seenIds.add(item.id);
    nameIndex.set(nameKey, pool.length);
    pool.push(item);
  }
}

async function searchCharacters(query: string, page: number, pageSize: number) {
  const q = query.trim();
  const pool: CharacterListItem[] = [];
  const seenIds = new Set<number>();
  const nameIndex = new Map<string, number>();
  const targetCount = page * pageSize + pageSize;

  for (let apiPage = 0; apiPage < 40 && pool.length < targetCount; apiPage++) {
    const batch = await apiFetch<IceAndFireCharacter[]>(
      `/characters?page=${apiPage}&pageSize=50`,
    );
    if (batch.length === 0) break;
    const matches = batch.filter((c) => c.name?.trim() && matchesSearch(c, q));
    appendUnique(pool, seenIds, nameIndex, filterBrowsable(matches.map(toListItem)));
  }

  const start = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    hasNext: pool.length > start + pageSize,
    hasPrevious: page > 1,
    results: dedupeCharacterList(pool.slice(start, start + pageSize)),
  };
}

async function fetchBrowsablePage(page: number, pageSize: number) {
  const pool: CharacterListItem[] = [];
  const seenIds = new Set<number>();
  const nameIndex = new Map<string, number>();
  const targetCount = page * pageSize + pageSize;

  for (let apiPage = 0; apiPage < 60 && pool.length < targetCount; apiPage++) {
    const batch = await apiFetch<IceAndFireCharacter[]>(
      `/characters?page=${apiPage}&pageSize=50`,
    );
    if (batch.length === 0) break;

    appendUnique(
      pool,
      seenIds,
      nameIndex,
      filterBrowsable(batch.filter((c) => c.name?.trim()).map(toListItem)),
    );
  }

  const start = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    hasNext: pool.length > start + pageSize,
    hasPrevious: page > 1,
    results: dedupeCharacterList(pool.slice(start, start + pageSize)),
  };
}

export async function fetchCharacters(
  page = 1,
  pageSize = 9,
  search?: string,
): Promise<{
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  results: CharacterListItem[];
}> {
  await warmImageCache();

  if (search?.trim()) {
    return searchCharacters(search, page, pageSize);
  }

  return fetchBrowsablePage(page, pageSize);
}

export async function fetchCharacter(id: number): Promise<CharacterDetail> {
  await warmImageCache();

  if (id === 9001) {
    const { NIGHT_KING_STATIC } = await import('../data/popularCharacters.js');
    return {
      ...NIGHT_KING_STATIC,
      died: 'Destroyed at Winterfell',
      alive: false,
      status: 'Deceased',
      aliases: ['The Night King'],
      allegiances: [],
      books: [],
      povBooks: [],
    };
  }

  const c = await apiFetch<IceAndFireCharacter>(`/characters/${id}`);
  const died = c.died?.trim() || '—';
  const alive = c.alive ?? null;
  const tvSeries = c.tvSeries ?? [];

  return {
    ...toListItem(c),
    died,
    alive,
    status: deriveCharacterStatus(alive, died, tvSeries),
    aliases: c.aliases?.filter(Boolean) ?? [],
    allegiances: c.allegiances ?? [],
    books: c.books ?? [],
    povBooks: c.povBooks ?? [],
  };
}

export function toCharacterSnapshot(character: CharacterDetail) {
  return {
    name: character.name,
    gender: character.gender,
    culture: character.culture,
    born: character.born,
    died: character.died,
    titles: character.titles,
    tvSeries: character.tvSeries,
    playedBy: character.playedBy,
    imageUrl: character.imageUrl,
  };
}
