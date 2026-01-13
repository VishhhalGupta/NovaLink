import { Router } from 'express';
import multer from 'multer';
import postController from '../controllers/post.controller';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

/**
 * @route   POST /api/linkedin/post/text
 * @desc    Create a text post on LinkedIn
 * @access  Private (requires valid access token)
 * @body    text, visibility (optional), organizationId (optional)
 */
router.post('/text', postController.createTextPost.bind(postController));

/**
 * @route   POST /api/linkedin/post/image
 * @desc    Create an image post on LinkedIn with image URL
 * @access  Private (requires valid access token)
 * @body    text, imageUrl, imageDescription (optional), visibility (optional), organizationId (optional)
 */
router.post('/image', postController.createImagePost.bind(postController));

/**
 * @route   POST /api/linkedin/post/image/upload
 * @desc    Create an image post on LinkedIn with binary image upload
 * @access  Private (requires valid access token)
 * @body    text (form field), image (file), mediaDescription (optional), visibility (optional), organizationId (optional)
 */
router.post('/image/upload', upload.single('image'), postController.createImagePostWithBinary.bind(postController));

/**
 * @route   POST /api/linkedin/post/video/upload
 * @desc    Create a video post on LinkedIn with binary video upload
 * @access  Private (requires valid access token)
 * @body    text (form field), video (file), videoDescription (optional), visibility (optional), organizationId (optional)
 */
router.post('/video/upload', upload.single('video'), postController.createVideoPostWithBinary.bind(postController));

/**
 * @route   POST /api/linkedin/post/article
 * @desc    Share an article/link on LinkedIn
 * @access  Private (requires valid access token)
 * @body    text, articleUrl, articleTitle (optional), articleDescription (optional), visibility (optional), organizationId (optional)
 */
router.post('/article', postController.createArticlePost.bind(postController));

export default router;
