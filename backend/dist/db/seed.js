import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './connection.js';
import { User } from '../models/User.js';
const DEMO_EMAIL = 'demo@umpisa.dev';
const DEMO_PASSWORD = 'password123';
async function seed() {
    await connectDb();
    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (existing) {
        console.log('Demo user already exists:', DEMO_EMAIL);
        await disconnectDb();
        return;
    }
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await User.create({
        email: DEMO_EMAIL,
        passwordHash,
        name: 'Demo User',
    });
    console.log('Seeded demo user:');
    console.log('  Email:   ', DEMO_EMAIL);
    console.log('  Password:', DEMO_PASSWORD);
    await disconnectDb();
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
