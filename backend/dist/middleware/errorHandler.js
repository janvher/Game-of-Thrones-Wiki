import { ZodError } from 'zod';
export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        res.status(400).json({ error: 'Validation failed', details: err.flatten() });
        return;
    }
    if (err instanceof Error) {
        if (err.message.startsWith('Ice and Fire') ||
            err.message.startsWith('Wiki of Thrones')) {
            res.status(502).json({ error: err.message });
            return;
        }
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}
