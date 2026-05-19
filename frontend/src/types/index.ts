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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface CourtProgress {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  courtSize: number;
  uniqueCultures: number;
  uniqueHouses: number;
  totalPageViews: number;
  achievements: Achievement[];
  unlockedCount: number;
}

export interface CourtBriefing {
  greeting: string;
  summary: string;
  lastVisitedPath: string | null;
  lastVisitedLabel: string | null;
  nextGoal: { name: string; description: string; progress: number; target: number } | null;
  recommendedCharacter: {
    id: number;
    name: string;
    culture: string;
    imageUrl?: string;
    reason: string;
  } | null;
}

export interface TrendingPath {
  path: string;
  views: number;
  label: string;
}

export interface ActivityDay {
  date: string;
  views: number;
}

export interface SectionViews {
  section: string;
  views: number;
}

export interface RealmInsights {
  trending: TrendingPath[];
  trendingCharacters: Array<{ characterId: number; views: number }>;
  activityByDay: ActivityDay[];
  viewsBySection: SectionViews[];
}
