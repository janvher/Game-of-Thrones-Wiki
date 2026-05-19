import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';
import favoriteRoutes from './routes/favorites.js';
import analyticsRoutes from './routes/analytics.js';
import wikiRoutes from './routes/wiki.js';
import pushRoutes from './routes/push.js';
import courtRoutes from './routes/court.js';
import { yoga } from './graphql/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';
import { fetchPopularCharacters } from './services/popularCharacters.js';
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.get('/api/health', (_req, res) => {
        res.json({
            status: 'ok',
            theme: 'game-of-thrones',
            graphql: '/graphql',
            graphiql: '/graphql',
        });
    });
    app.use('/api/auth', authRoutes);
    // Register before /api/characters router so "popular" is never parsed as :id
    app.get('/api/characters/popular', requireAuth, async (_req, res, next) => {
        try {
            const popular = await fetchPopularCharacters();
            res.json(popular);
        }
        catch (err) {
            next(err);
        }
    });
    app.use('/api/characters', characterRoutes);
    app.use('/api/favorites', favoriteRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/court', courtRoutes);
    app.use('/api/wiki', wikiRoutes);
    app.use('/api/push', pushRoutes);
    app.use(yoga.graphqlEndpoint, yoga);
    app.use(errorHandler);
    return app;
}
