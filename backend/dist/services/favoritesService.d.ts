import type { Types } from 'mongoose';
export declare function listFavorites(userId: Types.ObjectId): Promise<{
    id: string;
    characterId: number;
    characterName: string;
    characterData: import("mongoose").FlattenMaps<import("../models/Favorite.js").ICharacterSnapshot>;
    createdAt: string;
}[]>;
export declare function addFavorite(userId: Types.ObjectId, characterId: number): Promise<{
    id: string;
    characterId: number;
    characterName: string;
    characterData: import("../models/Favorite.js").ICharacterSnapshot;
    createdAt: string;
}>;
export declare function removeFavorite(userId: Types.ObjectId, characterId: number): Promise<boolean>;
