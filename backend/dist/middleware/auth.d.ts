import type { Request, Response, NextFunction } from 'express';
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function signToken(userId: string): string;
