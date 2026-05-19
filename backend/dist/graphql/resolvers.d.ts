import { type GraphQLContext } from './context.js';
export declare const resolvers: {
    Query: {
        me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
            id: string;
            email: string;
            name: string;
        };
        characters: (_: unknown, args: {
            page?: number;
            pageSize?: number;
            search?: string;
        }, ctx: GraphQLContext) => Promise<{
            page: number;
            pageSize: number;
            hasNext: boolean;
            hasPrevious: boolean;
            results: import("../services/iceAndFire.js").CharacterListItem[];
        }>;
        character: (_: unknown, args: {
            id: number;
        }, ctx: GraphQLContext) => Promise<import("../services/iceAndFire.js").CharacterDetail>;
        favorites: (_: unknown, __: unknown, ctx: GraphQLContext) => Promise<{
            id: string;
            characterId: number;
            characterName: string;
            characterData: import("mongoose").FlattenMaps<import("../models/Favorite.js").ICharacterSnapshot>;
            createdAt: string;
        }[]>;
        analyticsSummary: (_: unknown, __: unknown, ctx: GraphQLContext) => Promise<{
            path: string;
            views: number;
        }[]>;
    };
    Mutation: {
        addFavorite: (_: unknown, args: {
            characterId: number;
        }, ctx: GraphQLContext) => Promise<{
            id: string;
            characterId: number;
            characterName: string;
            characterData: import("../models/Favorite.js").ICharacterSnapshot;
            createdAt: string;
        }>;
        removeFavorite: (_: unknown, args: {
            characterId: number;
        }, ctx: GraphQLContext) => Promise<boolean>;
        trackPageView: (_: unknown, args: {
            path: string;
        }, ctx: GraphQLContext) => Promise<boolean>;
    };
};
