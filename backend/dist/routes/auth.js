import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';
const router = Router();
const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
const registerSchema = credentialsSchema.extend({
    name: z.string().min(1).max(100),
});
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email: email.toLowerCase(), passwordHash, name });
        const token = signToken(user._id.toString());
        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, name: user.name },
        });
    }
    catch (err) {
        next(err);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = credentialsSchema.parse(req.body);
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = signToken(user._id.toString());
        res.json({
            token,
            user: { id: user._id, email: user.email, name: user.name },
        });
    }
    catch (err) {
        next(err);
    }
});
router.get('/me', requireAuth, (req, res) => {
    const user = req.user;
    res.json({ id: user._id, email: user.email, name: user.name });
});
export default router;
