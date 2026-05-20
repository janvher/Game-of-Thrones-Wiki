import type { RealmInsights } from '../types';

export function createEmptyRealmInsights(): RealmInsights {
  const activityByDay = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    activityByDay.push({ date: d.toISOString().slice(0, 10), views: 0 });
  }
  return {
    trending: [],
    trendingCharacters: [],
    activityByDay,
    viewsBySection: [{ section: 'Explore the realm', views: 1 }],
  };
}
