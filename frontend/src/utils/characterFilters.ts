import type { CharacterListItem } from '../types';

export type GenderFilter = 'all' | 'Male' | 'Female' | 'Unknown';
export type CourtFilter = 'all' | 'in_court' | 'not_in_court';
export type SortOption = 'name' | 'culture' | 'tv_appearances';

export interface ExplorerFilters {
  gender: GenderFilter;
  culture: string;
  court: CourtFilter;
  sort: SortOption;
}

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  gender: 'all',
  culture: 'all',
  court: 'all',
  sort: 'name',
};

export function inferHouseFromCharacter(c: CharacterListItem): string | null {
  const hay = [c.name, c.culture, ...c.titles].join(' ').toLowerCase();
  const houses = [
    'stark',
    'lannister',
    'targaryen',
    'baratheon',
    'tyrell',
    'greyjoy',
    'martell',
    'tully',
    'arryn',
  ];
  for (const h of houses) {
    if (hay.includes(h)) return h.charAt(0).toUpperCase() + h.slice(1);
  }
  return c.culture && c.culture !== 'Unknown' ? c.culture : null;
}

export function applyExplorerFilters(
  characters: CharacterListItem[],
  filters: ExplorerFilters,
  favoriteIds: Set<number>,
): CharacterListItem[] {
  let list = [...characters];

  if (filters.gender !== 'all') {
    list = list.filter((c) => c.gender === filters.gender);
  }

  if (filters.culture !== 'all') {
    list = list.filter((c) => {
      const house = inferHouseFromCharacter(c);
      return (
        c.culture === filters.culture ||
        house === filters.culture ||
        c.culture.toLowerCase().includes(filters.culture.toLowerCase())
      );
    });
  }

  if (filters.court === 'in_court') {
    list = list.filter((c) => favoriteIds.has(c.id));
  } else if (filters.court === 'not_in_court') {
    list = list.filter((c) => !favoriteIds.has(c.id));
  }

  list.sort((a, b) => {
    if (filters.sort === 'culture') return a.culture.localeCompare(b.culture);
    if (filters.sort === 'tv_appearances') return b.tvSeries.length - a.tvSeries.length;
    return a.name.localeCompare(b.name);
  });

  return list;
}

export function uniqueCultures(characters: CharacterListItem[]): string[] {
  const cultures = new Set<string>();
  for (const c of characters) {
    if (c.culture && c.culture !== 'Unknown') cultures.add(c.culture);
    const house = inferHouseFromCharacter(c);
    if (house) cultures.add(house);
  }
  return [...cultures].sort();
}
