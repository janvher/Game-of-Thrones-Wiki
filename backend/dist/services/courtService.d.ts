import { getTrendingCharacterIds, getTrendingPaths, getUserActivityByDay, getUserViewsBySection } from './analyticsInsights.js';
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
    nextGoal: {
        name: string;
        description: string;
        progress: number;
        target: number;
    } | null;
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
export declare function getCourtProgress(userId: Types.ObjectId): Promise<CourtProgress>;
export declare function getCourtBriefing(userId: Types.ObjectId, userName: string): Promise<CourtBriefing>;
export declare function getRealmInsights(userId: Types.ObjectId): Promise<RealmInsights>;
export declare function getNewlyUnlockedAchievement(before: CourtProgress, after: CourtProgress): Achievement | null;
export declare function milestoneMessageForAchievement(achievement: Achievement): {
    title: string;
    body: string;
};
