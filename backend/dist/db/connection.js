import mongoose from 'mongoose';
import { config } from '../config.js';
export async function connectDb(uri = config.mongodbUri) {
    await mongoose.connect(uri);
}
export async function disconnectDb() {
    await mongoose.disconnect();
}
