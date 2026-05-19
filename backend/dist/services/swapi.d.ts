export interface SwapiCharacter {
    name: string;
    height: string;
    mass: string;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
    gender: string;
    homeworld: string;
    films: string[];
    species: string[];
    vehicles: string[];
    starships: string[];
    created: string;
    edited: string;
    url: string;
}
export interface SwapiListResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
export interface SwapiCharacterListItem {
    name: string;
    height: string;
    mass: string;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
    gender: string;
    url: string;
}
export declare function fetchCharacters(page?: number, search?: string): Promise<{
    count: number;
    next: number | null;
    previous: number | null;
    results: Array<SwapiCharacterListItem & {
        id: number;
    }>;
}>;
export declare function fetchCharacter(id: number): Promise<SwapiCharacter & {
    id: number;
}>;
export declare function toCharacterSnapshot(character: SwapiCharacter & {
    id: number;
}): {
    name: string;
    height: string;
    mass: string;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
    gender: string;
    homeworld: string;
    films: string[];
};
