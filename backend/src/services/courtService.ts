import { Favorite } from '../models/Favorite.js';
import { fetchPopularCharacters } from './popularCharacters.js';
import {
  getTrendingCharacterIds,
  getTrendingPaths,
  getUserActivityByDay,
  getUserLastVisitedPath,
  getUserTotalPageViews,
  getUserViewsBySection,
} from './analyticsInsights.js';
import { uniqueHousesFromFavorites } from '../utils/houseUtils.js';
import type { Types } from 'mongoose';

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

export interface RealmInsights {
  trending: Awaited<ReturnType<typeof getTrendingPaths>>;
  trendingCharacters: Awaited<ReturnType<typeof getTrendingCharacterIds>>;
  activityByDay: Awaited<ReturnType<typeof getUserActivityByDay>>;
  viewsBySection: Awaited<ReturnType<typeof getUserViewsBySection>>;
}

const XP_PER_FAVORITE = 100;
const XP_PER_HOUSE = 50;
const XP_PER_ACHIEVEMENT = 75;
const XP_PER_PAGE_VIEW = 5;
const XP_PER_LEVEL = 500;

function pathLabel(path: string): string {
  if (path === '/dashboard') return 'Great Hall';
  if (path === '/explorer') return 'Character Hub';
  if (path === '/favorites') return 'Your Court';
  if (path === '/profile') return 'Profile';
  const charMatch = path.match(/^\/characters\/(\d+)$/);
  if (charMatch) return `Character dossier`;
  return path;
}

function buildAchievements(stats: {
  courtSize: number;
  uniqueCultures: number;
  uniqueHouses: number;
  totalPageViews: number;
}): Achievement[] {
  const defs: Array<Omit<Achievement, 'unlocked' | 'progress'> & { check: () => boolean; progress: () => number }> = [
    {
      id: 'first_sworn',
      name: 'First Ally',
      description: 'Swear your first character to your court',
      icon: '🛡️',
      target: 1,
      check: () => stats.courtSize >= 1,
      progress: () => Math.min(stats.courtSize, 1),
    },
    {
      id: 'court_of_three',
      name: 'Small Council',
      description: 'Build a court of 3 characters',
      icon: '👑',
      target: 3,
      check: () => stats.courtSize >= 3,
      progress: () => Math.min(stats.courtSize, 3),
    },
    {
      id: 'court_of_five',
      name: 'Rising Lord',
      description: 'Build a court of 5 characters',
      icon: '⚔️',
      target: 5,
      check: () => stats.courtSize >= 5,
      progress: () => Math.min(stats.courtSize, 5),
    },
    {
      id: 'court_of_ten',
      name: 'High Lord',
      description: 'Build a court of 10 characters',
      icon: '🏰',
      target: 10,
      check: () => stats.courtSize >= 10,
      progress: () => Math.min(stats.courtSize, 10),
    },
    {
      id: 'three_cultures',
      name: 'World Traveler',
      description: 'Recruit from 3 different cultures',
      icon: '🌍',
      target: 3,
      check: () => stats.uniqueCultures >= 3,
      progress: () => Math.min(stats.uniqueCultures, 3),
    },
    {
      id: 'three_houses',
      name: 'Alliance Builder',
      description: 'Represent 3 houses in your court',
      icon: '🤝',
      target: 3,
      check: () => stats.uniqueHouses >= 3,
      progress: () => Math.min(stats.uniqueHouses, 3),
    },
    {
      id: 'explorer',
      name: 'Realm Wanderer',
      description: 'Log 10 page views across the saga',
      icon: '🗺️',
      target: 10,
      check: () => stats.totalPageViews >= 10,
      progress: () => Math.min(stats.totalPageViews, 10),
    },
    {
      id: 'dedicated',
      name: 'Saga Scholar',
      description: 'Log 25 page views across the saga',
      icon: '📜',
      target: 25,
      check: () => stats.totalPageViews >= 25,
      progress: () => Math.min(stats.totalPageViews, 25),
    },
  ];

  return defs.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    icon: d.icon,
    target: d.target,
    unlocked: d.check(),
    progress: d.progress(),
  }));
}

function computeXp(stats: {
  courtSize: number;
  uniqueHouses: number;
  unlockedAchievements: number;
  totalPageViews: number;
}): number {
  return (
    stats.courtSize * XP_PER_FAVORITE +
    stats.uniqueHouses * XP_PER_HOUSE +
    stats.unlockedAchievements * XP_PER_ACHIEVEMENT +
    stats.totalPageViews * XP_PER_PAGE_VIEW
  );
}

export async function getCourtProgress(userId: Types.ObjectId): Promise<CourtProgress> {
  const favorites = await Favorite.find({ userId }).lean();
  const courtSize = favorites.length;
  const cultures = new Set(
    favorites.map((f) => f.characterData?.culture).filter((c) => c && c !== 'Unknown'),
  );
  const uniqueHouses = uniqueHousesFromFavorites(favorites);
  const totalPageViews = await getUserTotalPageViews(userId);

  const stats = {
    courtSize,
    uniqueCultures: cultures.size,
    uniqueHouses: uniqueHouses.length,
    totalPageViews,
  };

  const achievements = buildAchievements(stats);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const xp = computeXp({ ...stats, uniqueHouses: uniqueHouses.length, unlockedAchievements: unlockedCount });
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;

  return {
    level,
    xp,
    xpIntoLevel,
    xpForNextLevel,
    courtSize,
    uniqueCultures: cultures.size,
    uniqueHouses: uniqueHouses.length,
    totalPageViews,
    achievements,
    unlockedCount,
  };
}

export async function getCourtBriefing(
  userId: Types.ObjectId,
  userName: string,
): Promise<CourtBriefing> {
  const progress = await getCourtProgress(userId);
  const lastVisitedPath = await getUserLastVisitedPath(userId);
  const favoriteIds = new Set(
    (await Favorite.find({ userId }).select('characterId').lean()).map((f) => f.characterId),
  );

  let recommendedCharacter: CourtBriefing['recommendedCharacter'] = null;
  try {
    const popular = await fetchPopularCharacters();
    const pick = popular.find((c) => !favoriteIds.has(c.id));
    if (pick) {
      recommendedCharacter = {
        id: pick.id,
        name: pick.name,
        culture: pick.culture,
        imageUrl: pick.imageUrl,
        reason:
          progress.courtSize === 0
            ? 'Start your court with a legend from the realm'
            : 'Expand your court — popular in the realm',
      };
    }
  } catch {
    /* optional */
  }

  const nextLocked = progress.achievements.find((a) => !a.unlocked);
  const nextGoal = nextLocked
    ? {
        name: nextLocked.name,
        description: nextLocked.description,
        progress: nextLocked.progress,
        target: nextLocked.target,
      }
    : null;

  let summary: string;
  if (progress.courtSize === 0) {
    summary = 'Your court is empty. Explore the Character Hub and swear your first ally.';
  } else if (progress.uniqueHouses < 3) {
    summary = `${progress.courtSize} in your court · ${progress.uniqueHouses} house(s) · recruit more houses for Alliance Builder.`;
  } else {
    summary = `Level ${progress.level} ruler · ${progress.courtSize} allies · ${progress.uniqueHouses} houses · ${progress.unlockedCount}/${progress.achievements.length} badges.`;
  }

  return {
    greeting: `Welcome back, ${userName}`,
    summary,
    lastVisitedPath,
    lastVisitedLabel: lastVisitedPath ? pathLabel(lastVisitedPath) : null,
    nextGoal,
    recommendedCharacter,
  };
}

export async function getRealmInsights(userId: Types.ObjectId): Promise<RealmInsights> {
  const [trending, trendingCharacters, activityByDay, viewsBySection] = await Promise.all([
    getTrendingPaths(8),
    getTrendingCharacterIds(5),
    getUserActivityByDay(userId, 7),
    getUserViewsBySection(userId),
  ]);

  return { trending, trendingCharacters, activityByDay, viewsBySection };
}

export function getNewlyUnlockedAchievement(
  before: CourtProgress,
  after: CourtProgress,
): Achievement | null {
  const beforeIds = new Set(before.achievements.filter((a) => a.unlocked).map((a) => a.id));
  return after.achievements.find((a) => a.unlocked && !beforeIds.has(a.id)) ?? null;
}

export function milestoneMessageForAchievement(achievement: Achievement): { title: string; body: string } {
  const messages: Record<string, { title: string; body: string }> = {
    first_sworn: { title: 'First Ally sworn', body: 'Your court has begun. Keep building.' },
    court_of_three: { title: 'Small Council formed!', body: 'You now have 3 allies in your court.' },
    court_of_five: { title: 'Rising Lord', body: 'Your court has grown to 5 characters.' },
    court_of_ten: { title: 'High Lord achieved!', body: 'A court of 10 — the realm takes notice.' },
    three_houses: { title: 'Alliance Builder', body: 'Three houses stand behind your court.' },
    three_cultures: { title: 'World Traveler', body: 'Three cultures now serve your court.' },
    explorer: { title: 'Realm Wanderer', body: 'You have explored 10 corners of the saga.' },
    dedicated: { title: 'Saga Scholar', body: '25 journeys logged across the realm.' },
  };
  return messages[achievement.id] ?? { title: `Badge: ${achievement.name}`, body: achievement.description };
}
