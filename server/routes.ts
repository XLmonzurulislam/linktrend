import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bunnyService } from "./bunny";
import { requireAdmin } from "./middleware/adminAuth";
import { OAuth2Client } from "google-auth-library";
import multer from "multer";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const GOOGLE_CLIENT_ID = "149459573476-lc3gjhm1bd3dqu285cpjgd6d0v6602p3.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const execAsync = promisify(exec);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  }
});

// Function to get video duration
async function getVideoDuration(buffer: Buffer): Promise<string> {
  try {
    // Save buffer to temporary file
    const tempDir = '/tmp';
    const tempFile = path.join(tempDir, `temp_${Date.now()}.mp4`);
    await fs.writeFile(tempFile, buffer);

    // Use ffprobe to get duration
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFile}"`
    );

    // Clean up temp file
    await fs.unlink(tempFile);

    const seconds = Math.floor(parseFloat(stdout.trim()));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return '00:00';
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Test BunnyCDN connection
  app.get("/api/bunny/test", async (req, res) => {
    try {
      console.log('Testing BunnyCDN connection...');
      const files = await bunnyService.listFiles('');
      res.json({ 
        success: true, 
        message: 'BunnyCDN connection successful',
        storageZone: 'trending',
        files: files 
      });
    } catch (error: any) {
      console.error('BunnyCDN test failed:', error);
      res.status(500).json({ 
        success: false,
        error: 'BunnyCDN connection failed',
        details: error.message,
        hint: 'Please verify your API Key and Storage Zone name in server/bunny.ts'
      });
    }
  });

  // Upload video file
  app.post("/api/upload/video", upload.single('video'), async (req, res) => {
    try {
      console.log('Video upload request received');

      if (!req.file) {
        console.error('No video file in request');
        return res.status(400).json({ error: 'No video file provided' });
      }

      console.log('Video file details:', {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Get video duration
      const duration = await getVideoDuration(req.file.buffer);
      console.log('Video duration:', duration);

      const fileName = `videos/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const videoUrl = await bunnyService.uploadFile(
        fileName, 
        req.file.buffer,
        req.file.mimetype
      );

      console.log('Video uploaded successfully:', videoUrl);

      res.json({ 
        success: true, 
        url: videoUrl,
        fileName,
        duration 
      });
    } catch (error: any) {
      console.error('Video upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload video',
        details: error.message 
      });
    }
  });

  // Upload thumbnail
  app.post("/api/upload/thumbnail", upload.single('thumbnail'), async (req, res) => {
    try {
      console.log('Thumbnail upload request received');

      if (!req.file) {
        console.error('No thumbnail file in request');
        return res.status(400).json({ error: 'No thumbnail file provided' });
      }

      console.log('Thumbnail file details:', {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const fileName = `thumbnails/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const thumbnailUrl = await bunnyService.uploadFile(
        fileName, 
        req.file.buffer,
        req.file.mimetype
      );

      console.log('Thumbnail uploaded successfully:', thumbnailUrl);

      res.json({ 
        success: true, 
        url: thumbnailUrl,
        fileName 
      });
    } catch (error: any) {
      console.error('Thumbnail upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload thumbnail',
        details: error.message 
      });
    }
  });

  // Create video entry
  app.post("/api/videos", async (req, res) => {
    try {
      const videoData = {
        ...req.body,
        isPremium: req.body.price > 0,
      };

      const video = await storage.createVideo(videoData);
      res.json({ success: true, video });
    } catch (error) {
      console.error('Video creation error:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  });

  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json({ success: true, videos });
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json({ success: true, video });
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  });

  // Get videos by creator
  app.get("/api/videos/creator/:creatorId", async (req, res) => {
    try {
      const videos = await storage.getVideosByCreator(req.params.creatorId);
      res.json({ success: true, videos });
    } catch (error) {
      console.error('Get creator videos error:', error);
      res.status(500).json({ error: 'Failed to fetch creator videos' });
    }
  });

  // Increment video views
  app.post('/api/videos/:id/view', async (req, res) => {
    try {
      const videoId = req.params.id;
      const updatedVideo = await storage.incrementViews(videoId);

      if (!updatedVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      res.json({ success: true, video: updatedVideo });
    } catch (error) {
      console.error('Increment views error:', error);
      res.status(500).json({ error: 'Failed to increment views' });
    }
  });

  // Delete video (Admin only)
  app.delete("/api/videos/:id", requireAdmin, async (req, res) => {
    try {
      const videoId = req.params.id;
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Delete from BunnyCDN
      // Extract file names safely
      const videoFileName = video.videoUrl?.split('/').pop();
      const thumbnailFileName = video.thumbnailUrl?.split('/').pop();

      if (videoFileName) await bunnyService.deleteFile(`videos/${videoFileName}`);
      if (thumbnailFileName) await bunnyService.deleteFile(`thumbnails/${thumbnailFileName}`);

      // Delete from database
      await storage.deleteVideo(videoId);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  });

  // User authentication with Google token verification
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { credential } = req.body;
      
      if (!credential) {
        return res.status(400).json({ error: 'Google credential is required' });
      }

      // Verify Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.name) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }

      const email = payload.email;
      const name = payload.name;
      const avatar = payload.picture;

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user with avatar
        user = await storage.createUser({ email, name, avatar });
      }

      // Store user info in session
      req.session.userId = user.id;
      req.session.userEmail = user.email;

      res.json({ success: true, user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Failed to verify Google credentials' });
    }
  });

  // Verify session endpoint
  app.get("/api/auth/verify", async (req, res) => {
    try {
      if (req.session.userId) {
        const user = await storage.getUserById(req.session.userId);
        if (user) {
          return res.json({ success: true, user });
        }
      }
      res.json({ success: false, user: null });
    } catch (error) {
      console.error('Session verification error:', error);
      res.json({ success: false, user: null });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        console.error('Admin credentials not configured in environment variables');
        return res.status(500).json({ error: 'Admin login not configured' });
      }

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (username === adminUsername && password === adminPassword) {
        // Create or get admin user
        let adminUser = await storage.getUserByEmail('admin@system.local');
        
        if (!adminUser) {
          adminUser = await storage.createUser({
            email: 'admin@system.local',
            name: 'System Administrator',
            avatar: undefined
          });
        }

        // Store admin session
        req.session.userId = adminUser.id;
        req.session.userEmail = adminUser.email;

        res.json({ success: true, user: adminUser });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // User routes (Admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Transaction routes
  app.post("/api/transactions", async (req, res) => {
    try {
      const transaction = await storage.createTransaction(req.body);
      res.json({ success: true, transaction });
    } catch (error: any) {
      console.error('Create transaction error:', error);
      if (error.message === 'Transaction ID already exists') {
        return res.status(400).json({ error: 'This transaction ID has already been used. Please check your transaction ID.' });
      }
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  app.get("/api/transactions", requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json({ success: true, transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get("/api/transactions/pending", requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json({ success: true, transactions });
    } catch (error) {
      console.error('Get pending transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch pending transactions' });
    }
  });

  app.post("/api/transactions/:id/approve", requireAdmin, async (req, res) => {
    try {
      const transaction = await storage.approveTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ success: true, transaction });
    } catch (error) {
      console.error('Approve transaction error:', error);
      res.status(500).json({ error: 'Failed to approve transaction' });
    }
  });

  app.post("/api/transactions/:id/reject", requireAdmin, async (req, res) => {
    try {
      const transaction = await storage.rejectTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ success: true, transaction });
    } catch (error) {
      console.error('Reject transaction error:', error);
      res.status(500).json({ error: 'Failed to reject transaction' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}