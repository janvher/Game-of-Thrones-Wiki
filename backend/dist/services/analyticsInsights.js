import { PageView } from '../models/PageView.js';
function pathLabel(path) {
    if (path === '/dashboard')
        return 'Great Hall';
    if (path === '/explorer')
        return 'Character Hub';
    if (path === '/favorites')
        return 'Your Court';
    if (path === '/profile')
        return 'Profile';
    const charMatch = path.match(/^\/characters\/(\d+)$/);
    if (charMatch)
        return `Character #${charMatch[1]}`;
    return path;
}
function pathSection(path) {
    if (path.startsWith('/characters/'))
        return 'Character dossiers';
    if (path === '/dashboard')
        return 'Great Hall';
    if (path === '/explorer')
        return 'Character Hub';
    if (path === '/favorites')
        return 'Your Court';
    if (path === '/profile')
        return 'Profile';
    return 'Other';
}
export async function getTrendingPaths(limit = 8) {
    const summary = await PageView.aggregate([
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
    ]);
    return summary.map((s) => ({
        path: s._id,
        views: s.count,
        label: pathLabel(s._id),
    }));
}
export async function getUserActivityByDay(userId, days = 7) {
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
    const byDate = new Map(raw.map((r) => [r._id, r.count]));
    const result = [];
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
export async function getUserViewsBySection(userId) {
    const summary = await PageView.aggregate([
        { $match: { userId } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
    ]);
    const sectionCounts = new Map();
    for (const row of summary) {
        const section = pathSection(row._id);
        sectionCounts.set(section, (sectionCounts.get(section) ?? 0) + row.count);
    }
    return [...sectionCounts.entries()]
        .map(([section, views]) => ({ section, views }))
        .sort((a, b) => b.views - a.views);
}
export async function getUserTotalPageViews(userId) {
    return PageView.countDocuments({ userId });
}
export async function getUserLastVisitedPath(userId) {
    const last = await PageView.findOne({ userId }).sort({ viewedAt: -1 }).lean();
    return last?.path ?? null;
}
export async function getTrendingCharacterIds(limit = 5) {
    const summary = await PageView.aggregate([
        { $match: { path: { $regex: /^\/characters\/\d+$/ } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
    ]);
    return summary
        .map((s) => {
        const match = s._id.match(/\/characters\/(\d+)/);
        return match ? { characterId: parseInt(match[1], 10), views: s.count } : null;
    })
        .filter((x) => x !== null);
}
