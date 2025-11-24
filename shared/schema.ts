
import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

export interface IVideo extends Document {
  id: string;
  title: string;
  description: string;
  price: number;
  isPremium: boolean;
  creator: string;
  creatorId: string;
  thumbnail: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: string;
  duration: string;
  uploadDate: string;
  createdAt: Date;
}

const videoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  isPremium: { type: Boolean, required: true, default: false },
  creator: { type: String, required: true },
  creatorId: { type: String, required: true },
  thumbnail: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  views: { type: String, required: true, default: "0" },
  duration: { type: String, required: true, default: "00:00" },
  uploadDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: function(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    }
  }
});

export const Video = mongoose.model<IVideo>("Video", videoSchema);

export const insertVideoSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number().default(0),
  isPremium: z.boolean().default(false),
  creator: z.string(),
  creatorId: z.string(),
  thumbnail: z.string(),
  thumbnailUrl: z.string(),
  videoUrl: z.string(),
  views: z.string().default("0"),
  duration: z.string().default("00:00"),
  uploadDate: z.string(),
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type VideoType = IVideo;

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  unlockedVideos: string[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  unlockedVideos: [{ type: String }],
  createdAt: { type: Date, default: Date.now, required: true },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: function(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    }
  }
});

export const User = mongoose.model<IUser>("User", userSchema);

export interface ITransaction extends Document {
  id: string;
  videoId: string;
  userId: string;
  amount: number;
  method: string;
  mobileNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  videoId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  trxId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now, required: true },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: function(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      return ret;
    }
  }
});

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
