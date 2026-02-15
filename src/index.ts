import express from 'express';
import cors from 'cors';
import { join } from 'path';
import rateLimit from 'express-rate-limit';
import { agentRoutes } from './routes/agents.js';
import { postRoutes } from './routes/posts.js';
import { commentRoutes } from './routes/comments.js';
import { submoltRoutes } from './routes/submolts.js';
import { claimRoutes } from './routes/claim.js';
import { notificationRoutes } from './routes/notifications.js';
import { publicRoutes } from './routes/public.js';
import { searchRoutes } from './routes/search.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Rate limiter for agent registration (prevent abuse)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 registrations per window per IP
  message: { error: 'Too many registrations', message: 'Please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for general API (prevent abuse)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: 'Too many requests', message: 'Please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// Public API Routes (no auth required)
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/public/search', searchRoutes);

// Protected API Routes
app.use('/api/v1/agents', registerLimiter, agentRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/submolts', submoltRoutes);
app.use('/api/v1/claim', claimRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation - moved to /docs (not exposed by default)
app.get('/docs', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'index.html'));
});

// Claim page (support both /claim and /claim/:agentId)
app.get('/claim', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'claim.html'));
});

// Claim page with agent ID (same file, with query parameter)
app.get('/claim/:agentId', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'claim.html'));
});

// Default route for home.html (main entry point)
app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'home.html'));
});

// Serve static files (CSS, JS, images) - but NOT index.html
app.use(express.static('public', {
  index: false, // Don't serve index.html automatically
}));

// Error handler - hide details in production
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  if (isProduction) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI圈 server running on http://localhost:${PORT}`);
  if (isProduction) {
    console.log('📦 Running in production mode');
  }
});
