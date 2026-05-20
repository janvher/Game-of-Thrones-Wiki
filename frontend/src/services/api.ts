import type {
  ArenaAction,
  ArenaBattle,
  ArenaMode,
  ArenaProfile,
  AuthResponse,
  BattleEvent,
  Character,
  CharacterListItem,
  CourtBriefing,
  CourtProgress,
  Favorite,
  LeaderboardEntry,
  LoadoutTrait,
  PageViewSummary,
  PaginatedCharacters,
  RealmInsights,
  User,
  WikiArticle,
} from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? res.statusText, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  me: (token: string) => request<User>('/auth/me', { token }),

  getPopularCharacters: (token: string) =>
    request<CharacterListItem[]>('/characters/popular', { token }),

  getCharacters: (token: string, page = 1, search?: string, pageSize = 9) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) params.set('search', search);
    return request<PaginatedCharacters>(`/characters?${params}`, { token });
  },

  getCharacter: (token: string, id: number) =>
    request<Character>(`/characters/${id}`, { token }),

  getFavorites: (token: string) => request<Favorite[]>('/favorites', { token }),

  addFavorite: (token: string, characterId: number) =>
    request<Favorite>('/favorites', {
      method: 'POST',
      token,
      body: JSON.stringify({ characterId }),
    }),

  removeFavorite: (token: string, characterId: number) =>
    request<void>(`/favorites/${characterId}`, { method: 'DELETE', token }),

  getWikiLore: (token: string, page = 1) =>
    request<WikiArticle[]>(`/wiki/lore?page=${page}&perPage=6`, { token }),

  getWikiHub: (token: string) =>
    request<WikiArticle[]>('/wiki/hub?perPage=8', { token }),

  trackPageView: (token: string, path: string) =>
    request<void>('/analytics/page-view', {
      method: 'POST',
      token,
      body: JSON.stringify({ path }),
    }),

  getAnalyticsSummary: (token: string) =>
    request<PageViewSummary[]>('/analytics/summary', { token }),

  getCourtProgress: (token: string) => request<CourtProgress>('/court/progress', { token }),

  getCourtBriefing: (token: string) => request<CourtBriefing>('/court/briefing', { token }),

  getRealmInsights: (token: string) => request<RealmInsights>('/court/realm-insights', { token }),

  getArenaProfile: (token: string) => request<ArenaProfile>('/arena/profile', { token }),

  getArenaLeaderboard: (token: string) =>
    request<LeaderboardEntry[]>('/arena/leaderboard', { token }),

  getActiveArenaBattle: (token: string) =>
    request<ArenaBattle | null>('/arena/battle/active', { token }),

  updateArenaLoadout: (
    token: string,
    loadout: { houseBonus?: string | null; trait?: LoadoutTrait },
  ) =>
    request<{ houseBonus: string | null; trait: LoadoutTrait }>('/arena/loadout', {
      method: 'PUT',
      token,
      body: JSON.stringify(loadout),
    }),

  startArenaBattle: (
    token: string,
    body: {
      mode: ArenaMode;
      playerCharacterId: number;
      opponentCharacterId?: number;
      playerTeamIds?: number[];
    },
  ) =>
    request<ArenaBattle>('/arena/battle/start', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  submitArenaTurn: (token: string, battleId: string, action: ArenaAction) =>
    request<{
      battle: ArenaBattle;
      events: BattleEvent[];
      battleComplete: boolean;
      tournamentAdvanced: boolean;
      matchResult: {
        winnerSide: string;
        pointsEarned: number;
        rating: number;
        summary: string;
      } | null;
    }>('/arena/battle/turn', {
      method: 'POST',
      token,
      body: JSON.stringify({ battleId, action }),
    }),

  forfeitArenaBattle: (token: string, battleId: string) =>
    request<{
      battle: ArenaBattle;
      matchResult: { winnerSide: string; pointsEarned: number; rating: number; summary: string };
    }>('/arena/battle/forfeit', {
      method: 'POST',
      token,
      body: JSON.stringify({ battleId }),
    }),

  getVapidPublicKey: () => request<{ publicKey: string }>('/push/vapid-public-key'),

  subscribePush: (
    token: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  ) =>
    request<{ ok: boolean }>('/push/subscribe', {
      method: 'POST',
      token,
      body: JSON.stringify(subscription),
    }),

  unsubscribePush: (token: string, endpoint: string) =>
    request<void>('/push/unsubscribe', {
      method: 'POST',
      token,
      body: JSON.stringify({ endpoint }),
    }),

  testPush: (token: string) =>
    request<{ ok: boolean }>('/push/test', { method: 'POST', token }),
};

export { ApiError };
