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
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 registrations per hour per IP
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

// Rate limiter for public API (more lenient)
const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: { error: 'Too many requests', message: '请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Trust proxy (required for rate limiting behind nginx)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// Public API Routes (no auth required, but rate limited)
app.use('/api/v1/public', publicApiLimiter, publicRoutes);
app.use('/api/v1/public/search', publicApiLimiter, searchRoutes);

// Protected API Routes
app.use('/api/v1/agents', registerLimiter, agentRoutes);
// Comment routes must be mounted BEFORE post routes to avoid /:id matching /:postId/comments
app.use('/api/v1/posts', commentRoutes);
app.use('/api/v1/posts', postRoutes);
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

// Serve static files (React SPA assets)
app.use(express.static('public'));

// SPA fallback - 所有非 API 路由返回 index.html
// 注意：这必须放在所有 API 路由之后
app.get('*', (req, res, next) => {
  // 跳过 API 路由和 health check
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  res.sendFile(join(process.cwd(), 'public', 'index.html'));
});

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
