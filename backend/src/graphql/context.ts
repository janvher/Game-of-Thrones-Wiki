import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User, type IUserDocument } from '../models/User.js';

export interface GraphQLContext {
  user: IUserDocument | null;
}

interface JwtPayload {
  userId: string;
}

export async function buildContext(authHeader?: string): Promise<GraphQLContext> {
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null };
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(payload.userId);
    return { user: user ?? null };
  } catch {
    return { user: null };
  }
}

export function requireUser(context: GraphQLContext): IUserDocument {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}
