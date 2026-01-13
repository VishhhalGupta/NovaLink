import { Router } from 'express';
import authController from '../controllers/auth.controller';

const router = Router();

/**
 * @route   GET /api/linkedin/auth/url
 * @desc    Get LinkedIn authorization URL
 * @access  Public
 * @query   redirectUri, state, scope (optional)
 */
router.get('/url', authController.getAuthorizationUrl.bind(authController));

/**
 * @route   POST /api/linkedin/auth/callback
 * @desc    Handle OAuth callback and exchange code for token
 * @access  Public
 * @body    code, redirectUri
 */
router.post('/callback', authController.handleCallback.bind(authController));

/**
 * @route   POST /api/linkedin/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @route   GET /api/linkedin/auth/verify
 * @desc    Verify current access token
 * @access  Public
 */
router.get('/verify', authController.verifyToken.bind(authController));

export default router;
