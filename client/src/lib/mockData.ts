
import sciFiThumb from '@assets/generated_images/sci-fi_movie_thumbnail.png';
import cookingThumb from '@assets/generated_images/cooking_video_thumbnail.png';
import techThumb from '@assets/generated_images/tech_review_thumbnail.png';
import travelThumb from '@assets/generated_images/travel_vlog_thumbnail.png';

export interface Video {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  views: string;
  duration: string;
  isPremium: boolean;
  price: number; // in BDT
  description: string;
  uploadDate: string;
}

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Cyberpunk City: Night Walk 8K',
    creator: 'Neon Walker',
    thumbnail: sciFiThumb,
    views: '1.2M',
    duration: '45:20',
    isPremium: true,
    price: 150,
    description: 'Experience the futuristic streets of Neo-Tokyo in stunning 8K resolution. This premium walkthrough features immersive binaural audio.',
    uploadDate: '2 days ago'
  },
  {
    id: '2',
    title: 'Ultimate Pasta Carbonara Masterclass',
    creator: 'Chef Mario',
    thumbnail: cookingThumb,
    views: '850K',
    duration: '12:45',
    isPremium: false,
    price: 0,
    description: 'Learn the authentic Roman way to make Carbonara. No cream, just eggs, cheese, and guanciale.',
    uploadDate: '1 week ago'
  },
  {
    id: '3',
    title: 'M2 Max MacBook Pro Review - Still Worth It?',
    creator: 'TechFocus',
    thumbnail: techThumb,
    views: '450K',
    duration: '18:30',
    isPremium: true,
    price: 50,
    description: 'Deep dive into the performance of the M2 Max chip for creative professionals in 2025.',
    uploadDate: '3 days ago'
  },
  {
    id: '4',
    title: 'Hidden Gems of the Swiss Alps',
    creator: 'Wanderlust',
    thumbnail: travelThumb,
    views: '2.1M',
    duration: '24:15',
    isPremium: true,
    price: 100,
    description: 'Join us as we explore the secret valleys and untouched peaks of the Swiss Alps.',
    uploadDate: '5 days ago'
  }
];

export const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', color: '#E2136E' },
  { id: 'nagad', name: 'Nagad', color: '#F7931E' },
  { id: 'rocket', name: 'Rocket', color: '#8C3494' }
];
