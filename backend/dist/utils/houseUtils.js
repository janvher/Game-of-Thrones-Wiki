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
];
export function inferHouse(fields) {
    const hay = [fields.name ?? '', fields.culture ?? '', ...(fields.titles ?? []), ...(fields.allegiances ?? [])]
        .join(' ')
        .toLowerCase();
    for (const house of GREAT_HOUSES) {
        if (hay.includes(house.toLowerCase()))
            return house;
    }
    const culture = fields.culture?.trim();
    if (culture && culture !== 'Unknown' && culture !== '—') {
        return culture;
    }
    return null;
}
export function uniqueHousesFromFavorites(favorites) {
    const houses = new Set();
    for (const f of favorites) {
        const house = inferHouse({
            name: f.characterName,
            culture: f.characterData.culture,
            titles: f.characterData.titles,
        });
        if (house)
            houses.add(house);
    }
    return [...houses];
}
