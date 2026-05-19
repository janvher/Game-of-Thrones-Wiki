import { PageView } from '../models/PageView.js';
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

function pathLabel(path: string): string {
  if (path === '/dashboard') return 'Great Hall';
  if (path === '/explorer') return 'Character Hub';
  if (path === '/favorites') return 'Your Court';
  if (path === '/profile') return 'Profile';
  const charMatch = path.match(/^\/characters\/(\d+)$/);
  if (charMatch) return `Character #${charMatch[1]}`;
  return path;
}

function pathSection(path: string): string {
  if (path.startsWith('/characters/')) return 'Character dossiers';
  if (path === '/dashboard') return 'Great Hall';
  if (path === '/explorer') return 'Character Hub';
  if (path === '/favorites') return 'Your Court';
  if (path === '/profile') return 'Profile';
  return 'Other';
}

export async function getTrendingPaths(limit = 8): Promise<TrendingPath[]> {
  const summary = await PageView.aggregate([
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return summary.map((s) => ({
    path: s._id as string,
    views: s.count as number,
    label: pathLabel(s._id as string),
  }));
}

export async function getUserActivityByDay(
  userId: Types.ObjectId,
  days = 7,
): Promise<ActivityDay[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const raw = await PageView.aggregate([
    { $match: { userId, viewedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byDate = new Map(raw.map((r) => [r._id as string, r.count as number]));
  const result: ActivityDay[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    result.push({
      date: key,
      views: byDate.get(key) ?? 0,
    });
  }

  return result;
}

export async function getUserViewsBySection(userId: Types.ObjectId): Promise<SectionViews[]> {
  const summary = await PageView.aggregate([
    { $match: { userId } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
  ]);

  const sectionCounts = new Map<string, number>();
  for (const row of summary) {
    const section = pathSection(row._id as string);
    sectionCounts.set(section, (sectionCounts.get(section) ?? 0) + (row.count as number));
  }

  return [...sectionCounts.entries()]
    .map(([section, views]) => ({ section, views }))
    .sort((a, b) => b.views - a.views);
}

export async function getUserTotalPageViews(userId: Types.ObjectId): Promise<number> {
  return PageView.countDocuments({ userId });
}

export async function getUserLastVisitedPath(userId: Types.ObjectId): Promise<string | null> {
  const last = await PageView.findOne({ userId }).sort({ viewedAt: -1 }).lean();
  return last?.path ?? null;
}

export async function getTrendingCharacterIds(limit = 5): Promise<Array<{ characterId: number; views: number }>> {
  const summary = await PageView.aggregate([
    { $match: { path: { $regex: /^\/characters\/\d+$/ } } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return summary
    .map((s) => {
      const match = (s._id as string).match(/\/characters\/(\d+)/);
      return match ? { characterId: parseInt(match[1], 10), views: s.count as number } : null;
    })
    .filter((x): x is { characterId: number; views: number } => x !== null);
}
