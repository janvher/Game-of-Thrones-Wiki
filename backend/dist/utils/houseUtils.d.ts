declare const GREAT_HOUSES: readonly ["Stark", "Lannister", "Targaryen", "Baratheon", "Tyrell", "Greyjoy", "Martell", "Tully", "Arryn", "Frey", "Bolton"];
export type GreatHouse = (typeof GREAT_HOUSES)[number];
export declare function inferHouse(fields: {
    name?: string;
    culture?: string;
    titles?: string[];
    allegiances?: string[];
}): string | null;
export declare function uniqueHousesFromFavorites(favorites: Array<{
    characterName: string;
    characterData: {
        culture?: string;
        titles?: string[];
    };
}>): string[];
export {};
