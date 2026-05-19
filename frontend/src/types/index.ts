export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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

export interface WikiArticle {
  id: number;
  title: string;
  link: string;
  excerpt: string;
  imageUrl?: string;
  date: string;
  categories: string[];
}

export type CharacterStatus = 'Alive' | 'Deceased' | 'Unknown';

export interface Character extends CharacterListItem {
  died: string;
  alive: boolean | null;
  status: CharacterStatus;
  aliases: string[];
  allegiances: string[];
  books: string[];
  povBooks: string[];
  wikiArticles?: WikiArticle[];
}

export interface PaginatedCharacters {
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  results: CharacterListItem[];
}

export interface Favorite {
  id: string;
  characterId: number;
  characterName: string;
  characterData: Partial<Character>;
  createdAt: string;
}

export interface PageViewSummary {
  path: string;
  views: number;
}
