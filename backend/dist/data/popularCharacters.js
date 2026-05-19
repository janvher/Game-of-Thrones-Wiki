/** Popular roster — Ice and Fire IDs verified against anapioficeandfire.com */
export const POPULAR_CHARACTER_SPECS = [
    { name: 'Jon Snow', ids: [583] },
    { name: 'Arya Stark', ids: [148] },
    { name: 'Daenerys Targaryen', ids: [1303, 271] },
    { name: 'Tyrion Lannister', ids: [1052] },
    { name: 'Cersei Lannister', ids: [238] },
    { name: 'Sansa Stark', ids: [957] },
    { name: 'Night King', staticId: 9001 },
    { name: 'Jaime Lannister', ids: [529] },
];
export const NIGHT_KING_STATIC = {
    id: 9001,
    name: 'Night King',
    gender: 'Unknown',
    culture: 'White Walkers',
    born: 'Before the Long Night',
    titles: ['Leader of the Army of the Dead'],
    tvSeries: ['Season 4', 'Season 5', 'Season 6', 'Season 7', 'Season 8'],
    playedBy: ['Vladimir Furdik', 'Richard Brake'],
    imageUrl: '/images/night-king.svg',
};
export const HIDDEN_CHARACTER_NAMES = [
    'balon greyjoy',
    'balon',
    'baelon',
    'baelor',
    'walder frey',
    'walder',
];
