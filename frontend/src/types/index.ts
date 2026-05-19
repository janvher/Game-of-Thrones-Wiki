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

export type ArenaMode = 'duel' | 'team' | 'tournament';
export type ArenaAction = 'strike' | 'defend' | 'rally';
export type LoadoutTrait = 'aggressive' | 'defensive' | 'balanced';

export interface ArenaFighter {
  characterId: number;
  name: string;
  imageUrl?: string;
  culture: string;
  house: string | null;
  attack: number;
  defense: number;
  maxHp: number;
  hp: number;
  status: string;
  buffs: {
    defendActive: boolean;
    rallyActive: boolean;
    damageReduction: number;
  };
}

export interface ArenaBattle {
  id: string;
  mode: ArenaMode;
  status: 'active' | 'complete';
  player: ArenaFighter;
  opponent: ArenaFighter;
  playerTeam: ArenaFighter[];
  opponentTeam: ArenaFighter[];
  activePlayerTeamIndex: number;
  activeOpponentTeamIndex: number;
  turnNumber: number;
  log: string[];
  loadout: { houseBonus: string | null; trait: LoadoutTrait };
  tournament?: { round: number; bracketOpponentIds: number[]; currentOpponentIndex: number };
  winnerSide: 'player' | 'opponent' | null;
}

export interface BattleEvent {
  actor: 'player' | 'opponent';
  action: ArenaAction;
  damage: number;
  message: string;
}

export interface ArenaProfile {
  rating: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  totalDamageDealt: number;
  tournamentWins: number;
  teamBattleWins: number;
  rank: number;
  loadout: { houseBonus: string | null; trait: LoadoutTrait };
  recentMatches: Array<{
    id: string;
    mode: ArenaMode;
    winnerSide: string;
    summary: string;
    pointsEarned: number;
    ratingAfter: number;
    playedAt: string;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  rating: number;
  wins: number;
  losses: number;
  bestStreak: number;
}
