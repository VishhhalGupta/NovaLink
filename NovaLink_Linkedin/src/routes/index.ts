import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import postRoutes from './post.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'LinkedIn NovaLink Backend',
    },
  });
});

// LinkedIn routes
router.use('/linkedin/auth', authRoutes);
router.use('/linkedin/profile', profileRoutes);
router.use('/linkedin/post', postRoutes);

export default router;
