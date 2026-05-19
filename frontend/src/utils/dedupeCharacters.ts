import type { CharacterListItem } from '../types';

/** Ensures a page of cards has no duplicate ids or names (handles stale API responses). */
export function dedupeCharacters(items: CharacterListItem[]): CharacterListItem[] {
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const out: CharacterListItem[] = [];

  for (const item of items) {
    if (item.id > 0 && seenIds.has(item.id)) continue;
    const nameKey = item.name.toLowerCase().trim();
    if (seenNames.has(nameKey)) continue;
    if (item.id > 0) seenIds.add(item.id);
    seenNames.add(nameKey);
    out.push(item);
  }

  return out;
}
