import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_VIDEOS, Video } from './mockData';

interface PaymentRequest {
  id: string;
  videoId: string;
  userId: string;
  method: string;
  mobileNumber: string;
  trxId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

interface User {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  unlockedVideos?: string[];
}

interface HistoryItem {
  videoId: string;
  watchedAt: number;
}

interface AppState {
  // User State
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;

  // Payment/Content State
  unlockedVideos: string[]; // List of video IDs the user has access to
  pendingPayments: PaymentRequest[];
  myVideos: Video[]; // Videos uploaded by the user
  watchHistory: HistoryItem[]; // Watch history tracking

  // Actions
  requestAccess: (req: Omit<PaymentRequest, 'id' | 'status' | 'timestamp'>) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
  isUnlocked: (videoId: string) => boolean;
  hasPendingRequest: (videoId: string) => boolean;
  uploadVideo: (video: Video) => void;
  addToHistory: (videoId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (userData: User) => set(state => ({
        user: userData,
        // Clear watch history when switching to a different user
        watchHistory: state.user?.email !== userData.email ? [] : state.watchHistory
      })),
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { 
            method: 'POST',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, watchHistory: [] });
      },
      updateUser: (userData: Partial<User>) => set((state) => ({ 
        user: state.user ? { ...state.user, ...userData } : null 
      })),

      unlockedVideos: ['2'], // Free video is unlocked by default
      pendingPayments: [],
      myVideos: [],
      watchHistory: [],

      requestAccess: (req) => set(state => ({
        pendingPayments: [
          ...state.pendingPayments,
          {
            ...req,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
            timestamp: Date.now()
          }
        ]
      })),

      approvePayment: (paymentId) => set(state => {
        const payment = state.pendingPayments.find(p => p.id === paymentId);
        if (!payment) return state;

        // Update user state to reflect unlocked video
        const updatedUser = state.user ? { ...state.user } : null; // Create a mutable copy
        if (updatedUser && !updatedUser.unlockedVideos?.includes(payment.videoId)) {
          updatedUser.unlockedVideos = [...(updatedUser.unlockedVideos || []), payment.videoId];
        }

        return {
          pendingPayments: state.pendingPayments.filter(p => p.id !== paymentId),
          unlockedVideos: [...state.unlockedVideos, payment.videoId],
          user: updatedUser // Set the updated user state
        };
      }),

      rejectPayment: (paymentId) => set(state => {
        const payment = state.pendingPayments.find(p => p.id === paymentId);
        if (!payment) return state;

        // No change to user state needed for rejection, they just can't access the video
        return {
          pendingPayments: state.pendingPayments.filter(p => p.id !== paymentId)
        };
      }),

      isUnlocked: (videoId) => get().unlockedVideos.includes(videoId),
      hasPendingRequest: (videoId) => get().pendingPayments.some(p => p.videoId === videoId && p.status === 'pending'),

      uploadVideo: (video) => set(state => ({
        myVideos: [video, ...state.myVideos]
      })),

      addToHistory: (videoId) => set(state => {
        // Only track history for authenticated users
        if (!state.user) return state;

        // Remove existing entry for this video to avoid duplicates
        const filteredHistory = state.watchHistory.filter(h => h.videoId !== videoId);
        // Add to the beginning of the history
        return {
          watchHistory: [{ videoId, watchedAt: Date.now() }, ...filteredHistory]
        };
      })
    }),
    {
      name: 'streamflow-storage',
    }
  )
);