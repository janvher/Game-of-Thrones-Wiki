import { type CharacterStatus } from '../utils/characterStatus.js';
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
export declare function extractCharacterId(url: string): number;
/** Last-line guard so API responses never contain duplicate cards on one page. */
export declare function dedupeCharacterList(items: CharacterListItem[]): CharacterListItem[];
export declare function fetchCharacters(page?: number, pageSize?: number, search?: string): Promise<{
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    results: CharacterListItem[];
}>;
export declare function fetchCharacter(id: number): Promise<CharacterDetail>;
export declare function toCharacterSnapshot(character: CharacterDetail): {
    name: string;
    gender: string;
    culture: string;
    born: string;
    died: string;
    titles: string[];
    tvSeries: string[];
    playedBy: string[];
    imageUrl: string | undefined;
};
