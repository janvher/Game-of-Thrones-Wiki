import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';
export async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(payload.userId).select('-passwordHash');
        if (!user) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
export function signToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
}
