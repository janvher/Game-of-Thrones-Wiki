import mongoose, { Schema, type Document, type Model } from 'mongoose';

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

const favoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    characterId: { type: Number, required: true },
    characterName: { type: String, required: true },
    characterData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

favoriteSchema.index({ userId: 1, characterId: 1 }, { unique: true });

export const Favorite: Model<IFavoriteDocument> =
  mongoose.models.Favorite ??
  mongoose.model<IFavoriteDocument>('Favorite', favoriteSchema);
