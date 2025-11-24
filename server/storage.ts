import mongoose from "mongoose";
import { Video, Transaction, User, type InsertVideo, type IVideo, type ITransaction, type IUser } from "@shared/schema";

let isConnected = false;
let connectionAttempted = false;

export async function connectToMongoDB() {
  if (isConnected) {
    return;
  }

  if (connectionAttempted) {
    console.log("MongoDB connection already attempted, skipping...");
    return;
  }

  connectionAttempted = true;

  const MONGODB_URI = "mongodb+srv://sihabsorker:rwQfs8zspuJGjYhq@xoopost.u7fzfct.mongodb.net/?retryWrites=true&w=majority&appName=xoopost";

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'linktrend',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("Connected to MongoDB successfully - Database: linktrend");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("App will continue running but database operations may fail");
    // Don't throw error - let the app start even if MongoDB is not connected
  }
}

export interface IStorage {
  createVideo(videoData: InsertVideo): Promise<IVideo>;
  getVideoById(id: string): Promise<IVideo | null>;
  getAllVideos(): Promise<IVideo[]>;
  getVideosByCreator(creatorId: string): Promise<IVideo[]>;
  deleteVideo(id: string): Promise<void>;
  incrementViews(id: string): Promise<IVideo | null>;

  // Transaction methods
  createTransaction(transactionData: any): Promise<ITransaction>;
  getAllTransactions(): Promise<ITransaction[]>;
  getPendingTransactions(): Promise<ITransaction[]>;
  approveTransaction(id: string): Promise<ITransaction | null>;
  rejectTransaction(id: string): Promise<ITransaction | null>;

  // User methods
  createUser(userData: { email: string; name: string; avatar?: string }): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  deleteUser(id: string): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  constructor() {
    connectToMongoDB();
  }

  async createVideo(videoData: InsertVideo): Promise<IVideo> {
    const video = new Video(videoData);
    await video.save();
    return video.toObject();
  }

  async getVideoById(id: string): Promise<IVideo | null> {
    try {
      const video = await Video.findById(id);
      return video ? video.toObject() : null;
    } catch (error) {
      return null;
    }
  }

  async getAllVideos(): Promise<IVideo[]> {
    const videos = await Video.find().sort({ createdAt: -1 });
    return videos.map(v => v.toObject());
  }

  async getVideosByCreator(creatorId: string): Promise<IVideo[]> {
    const videos = await Video.find({ creatorId }).sort({ createdAt: -1 });
    return videos.map(v => v.toObject());
  }

  async deleteVideo(id: string): Promise<void> {
    await Video.findByIdAndDelete(id);
  }

  async incrementViews(id: string): Promise<IVideo | null> {
    try {
      const video = await Video.findById(id);
      if (!video) return null;

      const currentViews = parseInt(video.views) || 0;
      video.views = (currentViews + 1).toString();
      await video.save();

      return video.toObject();
    } catch (error) {
      return null;
    }
  }

  // Transaction methods
  async createTransaction(transactionData: any): Promise<ITransaction> {
    const existingTransaction = await Transaction.findOne({ trxId: transactionData.trxId });
    if (existingTransaction) {
      throw new Error('Transaction ID already exists');
    }

    const transaction = new Transaction(transactionData);
    await transaction.save();
    return transaction.toObject();
  }

  async getAllTransactions(): Promise<ITransaction[]> {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    return transactions.map(t => t.toObject());
  }

  async getPendingTransactions(): Promise<ITransaction[]> {
    const transactions = await Transaction.find({ status: 'pending' }).sort({ createdAt: -1 });
    return transactions.map(t => t.toObject());
  }

  async approveTransaction(id: string): Promise<ITransaction | null> {
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction) return null;

      transaction.status = 'approved';
      await transaction.save();

      // Unlock video for user
      const user = await User.findById(transaction.userId);
      if (user) {
        if (!user.unlockedVideos) {
          user.unlockedVideos = [];
        }
        if (!user.unlockedVideos.includes(transaction.videoId)) {
          user.unlockedVideos.push(transaction.videoId);
          await user.save();
        }
      }

      return transaction.toObject();
    } catch (error) {
      return null;
    }
  }

  async rejectTransaction(id: string): Promise<ITransaction | null> {
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction) return null;

      transaction.status = 'rejected';
      await transaction.save();

      return transaction.toObject();
    } catch (error) {
      return null;
    }
  }

  // User methods
  async createUser(userData: { email: string; name: string; avatar?: string }): Promise<IUser> {
    const user = new User({
      ...userData,
      unlockedVideos: [],
    });
    await user.save();
    return user.toObject();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    return user ? user.toObject() : null;
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      return user ? user.toObject() : null;
    } catch (error) {
      return null;
    }
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(u => u.toObject());
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }
}

export const storage = new MongoDBStorage();