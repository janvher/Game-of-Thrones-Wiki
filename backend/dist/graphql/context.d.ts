import { type IUserDocument } from '../models/User.js';
export interface GraphQLContext {
    user: IUserDocument | null;
}
export declare function buildContext(authHeader?: string): Promise<GraphQLContext>;
export declare function requireUser(context: GraphQLContext): IUserDocument;
