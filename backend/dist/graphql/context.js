import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';
export async function buildContext(authHeader) {
    if (!authHeader?.startsWith('Bearer ')) {
        return { user: null };
    }
    try {
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(payload.userId);
        return { user: user ?? null };
    }
    catch {
        return { user: null };
    }
}
export function requireUser(context) {
    if (!context.user) {
        throw new Error('Authentication required');
    }
    return context.user;
}
