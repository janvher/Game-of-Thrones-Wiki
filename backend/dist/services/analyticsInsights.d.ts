import type { Types } from 'mongoose';
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
export declare function getTrendingPaths(limit?: number): Promise<TrendingPath[]>;
export declare function getUserActivityByDay(userId: Types.ObjectId, days?: number): Promise<ActivityDay[]>;
export declare function getUserViewsBySection(userId: Types.ObjectId): Promise<SectionViews[]>;
export declare function getUserTotalPageViews(userId: Types.ObjectId): Promise<number>;
export declare function getUserLastVisitedPath(userId: Types.ObjectId): Promise<string | null>;
export declare function getTrendingCharacterIds(limit?: number): Promise<Array<{
    characterId: number;
    views: number;
}>>;
