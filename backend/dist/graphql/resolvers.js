import { PageView } from '../models/PageView.js';
import { fetchCharacter, fetchCharacters } from '../services/iceAndFire.js';
import { addFavorite, listFavorites, removeFavorite, } from '../services/favoritesService.js';
import { requireUser } from './context.js';
export const resolvers = {
    Query: {
        me: (_, __, ctx) => {
            const user = requireUser(ctx);
            return { id: String(user._id), email: user.email, name: user.name };
        },
        characters: async (_, args, ctx) => {
            requireUser(ctx);
            return fetchCharacters(args.page ?? 1, args.pageSize ?? 9, args.search);
        },
        character: async (_, args, ctx) => {
            requireUser(ctx);
            return fetchCharacter(args.id);
        },
        favorites: async (_, __, ctx) => {
            const user = requireUser(ctx);
            return listFavorites(user._id);
        },
        analyticsSummary: async (_, __, ctx) => {
            const user = requireUser(ctx);
            const summary = await PageView.aggregate([
                { $match: { userId: user._id } },
                { $group: { _id: '$path', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]);
            return summary.map((s) => ({ path: s._id, views: s.count }));
        },
    },
    Mutation: {
        addFavorite: async (_, args, ctx) => {
            const user = requireUser(ctx);
            try {
                return await addFavorite(user._id, args.characterId);
            }
            catch (err) {
                if (err instanceof Error && err.message === 'ALREADY_FAVORITE') {
                    throw new Error('Already in favorites');
                }
                if (err instanceof Error && err.message === 'NOT_FOUND') {
                    throw new Error('Character not found');
                }
                throw err;
            }
        },
        removeFavorite: async (_, args, ctx) => {
            const user = requireUser(ctx);
            return removeFavorite(user._id, args.characterId);
        },
        trackPageView: async (_, args, ctx) => {
            const user = requireUser(ctx);
            await PageView.create({ userId: user._id, path: args.path });
            return true;
        },
    },
};
