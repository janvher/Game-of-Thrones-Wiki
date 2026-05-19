import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { connectDb } from './db/connection.js';
import { migrateFavoritesCollection } from './db/migrate.js';
import { User } from './models/User.js';
import { createApp } from './app.js';
import { warmImageCache } from './services/characterImages.js';
const DEMO_EMAIL = 'demo@umpisa.dev';
const DEMO_PASSWORD = 'password123';
async function ensureDemoUser() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const result = await User.findOneAndUpdate({ email: DEMO_EMAIL }, { $set: { name: 'Demo User', passwordHash } }, { upsert: true, new: true });
    if (result) {
        console.log(`Demo account ready — ${DEMO_EMAIL} / ${DEMO_PASSWORD} (${result.name})`);
    }
}
async function main() {
    await connectDb();
    await migrateFavoritesCollection();
    await ensureDemoUser();
    await warmImageCache();
    const app = createApp();
    app.listen(config.port, () => {
        console.log(`Umpisa Inc - Jan Genvher Papica Exam API on http://localhost:${config.port}`);
    });
}
main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
