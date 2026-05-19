import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'umpisa-dev-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/umpisa',
  iceAndFireBaseUrl:
    process.env.ICE_AND_FIRE_BASE_URL ?? 'https://anapioficeandfire.com/api',
  wikiOfThronesBaseUrl:
    process.env.WIKI_OF_THRONES_BASE_URL ?? 'https://wikiofthrones.com/wp-json/wp/v2',
  thronesApiBaseUrl: process.env.THRONES_API_BASE_URL ?? 'https://thronesapi.com/api/v2',
  wikiLoreCategoryId: parseInt(process.env.WIKI_LORE_CATEGORY_ID ?? '174', 10),
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? '',
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:demo@umpisa.dev',
};
