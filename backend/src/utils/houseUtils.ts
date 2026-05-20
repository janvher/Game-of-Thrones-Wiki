const GREAT_HOUSES = [
  'Stark',
  'Lannister',
  'Targaryen',
  'Baratheon',
  'Tyrell',
  'Greyjoy',
  'Martell',
  'Tully',
  'Arryn',
  'Frey',
  'Bolton',
] as const;

export type GreatHouse = (typeof GREAT_HOUSES)[number];

export function inferHouse(fields: {
  name?: string;
  culture?: string;
  titles?: string[];
  allegiances?: string[];
}): string | null {
  const hay = [fields.name ?? '', fields.culture ?? '', ...(fields.titles ?? []), ...(fields.allegiances ?? [])]
    .join(' ')
    .toLowerCase();

  for (const house of GREAT_HOUSES) {
    if (hay.includes(house.toLowerCase())) return house;
  }

  const culture = fields.culture?.trim();
  if (culture && culture !== 'Unknown' && culture !== '—') {
    return culture;
  }

  return null;
}

export function uniqueHousesFromFavorites(
  favorites: Array<{
    characterName: string;
    characterData: { culture?: string; titles?: string[] };
  }>,
): string[] {
  const houses = new Set<string>();
  for (const f of favorites) {
    const house = inferHouse({
      name: f.characterName,
      culture: f.characterData.culture,
      titles: f.characterData.titles,
    });
    if (house) houses.add(house);
  }
  return [...houses];
}
