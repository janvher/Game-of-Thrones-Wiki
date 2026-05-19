import mongoose, { type Document, type Model } from 'mongoose';
export interface IUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
}
export type IUserDocument = IUser & Document;
export declare const User: Model<IUserDocument>;
