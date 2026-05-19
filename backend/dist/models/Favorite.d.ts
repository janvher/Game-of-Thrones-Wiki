import mongoose, { type Document, type Model } from 'mongoose';
export interface ICharacterSnapshot {
    name: string;
    gender: string;
    culture: string;
    born: string;
    died: string;
    titles: string[];
    tvSeries: string[];
    playedBy: string[];
    imageUrl?: string;
}
export interface IFavorite {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    characterId: number;
    characterName: string;
    characterData: ICharacterSnapshot;
    createdAt: Date;
}
export type IFavoriteDocument = IFavorite & Document;
export declare const Favorite: Model<IFavoriteDocument>;
