# LinkTrend - Premium Video Platform

## Overview

LinkTrend is a full-stack premium video streaming platform that allows creators to upload and monetize their content. The application features a React frontend with shadcn/ui components, an Express backend with MongoDB database, and integrates with BunnyCDN for video storage and streaming delivery. Users can browse videos from the database, upload videos directly to BunnyCDN, watch content using HTML5 video player, purchase premium content through mobile payment methods (bKash, Nagad, Rocket), and creators can manage their uploaded videos. The platform includes admin functionality for approving payment requests and managing user access.

## Recent Changes

### November 24, 2025
- **Implemented Secure Admin Login System**: 
  - Admin panel moved from `/admin` to `/sys-root-xs` route for security
  - Username/password authentication (credentials stored in environment variables: ADMIN_USERNAME, ADMIN_PASSWORD)
  - Removed ability to grant/revoke admin roles from the admin dashboard
  - Admin authentication creates/verifies `admin@system.local` system user
  - Session-based authentication with automatic verification on page load
  
### November 23, 2025
- **Migrated from PostgreSQL to MongoDB**: Replaced Drizzle ORM with Mongoose for MongoDB integration
- Converted from mockup prototype to full-stack application
- Implemented real BunnyCDN upload for video and thumbnail files
- Added real-time video streaming with HTML5 video player
- Connected all frontend pages to backend API endpoints
- Secured BunnyCDN credentials using environment variables
- Added automatic view count incrementing
- Fixed video player to show correct video based on URL parameter

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching
- Zustand with persistence middleware for client-side state management

**UI Component System:**
- shadcn/ui components based on Radix UI primitives (new-york style)
- Tailwind CSS v4 with custom design tokens for styling
- Custom fonts: Inter (sans-serif) and Outfit (display)
- Dark mode as the default theme with CSS variables for theming
- Lucide React for icons

**State Management Strategy:**
- Zustand store handles user authentication, video unlocking, payment requests, and admin state
- State persists to localStorage for user sessions
- TanStack React Query fetches and caches all video data from MongoDB database
- Real-time data synchronization between frontend and backend

**Key Features:**
- Google OAuth integration for authentication
- Video upload with thumbnail preview
- Payment request workflow with status tracking
- Admin dashboard for payment approval
- User dashboard for managing uploaded videos and purchases

### Backend Architecture

**Runtime & Framework:**
- Node.js with Express.js
- TypeScript with ESM modules
- Separate development and production entry points

**Development vs Production:**
- Development: Vite middleware integration with HMR for full-stack development
- Production: Pre-built static assets served from dist/public directory
- Raw body parsing for webhook validation (prepared for payment gateway integration)

**API Design:**
- RESTful endpoints under `/api` prefix
- File upload handling with Multer (500MB limit for videos)
- JSON request/response format
- Request logging with response capture for debugging

**Video Upload Flow:**
- Multipart form data handling for video and thumbnail files
- Direct upload to BunnyCDN storage
- Video metadata stored in database with CDN URLs
- Support for multiple image formats (png, jpg, jpeg) for thumbnails

### Database Architecture

**ORM & Database:**
- Mongoose ODM for type-safe MongoDB operations
- MongoDB as the primary database (MongoDB Atlas)
- Connection reuse with automatic connection management

**Schema Design:**
- `videos` collection as the primary entity with MongoDB ObjectId (exposed as string `id`)
- Fields for content metadata (title, description, duration, views)
- Creator identification (creator name and ID)
- Premium content pricing system (price in BDT, isPremium flag)
- CDN URL storage for both video and thumbnail
- Timestamp tracking with automatic creation dates

**Data Operations:**
- Insert operations return created documents with toObject() transformation
- View count incrementing with string-based storage
- Creator-based video filtering using MongoDB queries
- Virtual `id` field that maps MongoDB's `_id` to match frontend expectations
- Automatic `_id` to `id` conversion via schema transforms

### External Dependencies

**BunnyCDN Integration:**
- Storage Zone API for video and thumbnail uploads
- CDN hostname for content delivery
- PUT requests for file uploads with API key authentication
- Support for large file uploads (500MB limit)
- Error handling for authentication and storage zone issues
- Environment-based configuration (storage zone name, API key, CDN hostname)

**Google OAuth:**
- Client ID: 149459573476-lc3gjhm1bd3dqu285cpjgd6d0v6602p3.apps.googleusercontent.com
- JWT token decoding for user profile extraction
- Used for user authentication and profile management

**MongoDB:**
- MongoDB Atlas connection via MONGODB_URI secret
- Automatic connection pooling and reconnection handling
- Environment variable: MONGODB_URI

**Payment Gateway (Prepared):**
- Designed for Bangladeshi mobile payment methods (bKash, Nagad, Rocket)
- Payment request workflow with pending/approved/rejected status
- Transaction ID and mobile number validation
- Admin approval system before granting video access

**Replit Platform Integrations:**
- Vite plugins for development: runtime-error-modal, cartographer, dev-banner
- Meta image plugin for OpenGraph social sharing
- Deployment URL detection for production builds