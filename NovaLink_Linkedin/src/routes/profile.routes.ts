import { Router } from 'express';
import profileController from '../controllers/profile.controller';

const router = Router();

/**
 * @route   GET /api/linkedin/profile
 * @desc    Get authenticated user's profile
 * @access  Private (requires valid access token)
 */
router.get('/', profileController.getProfile.bind(profileController));

/**
 * @route   GET /api/linkedin/profile/organizations
 * @desc    Get organizations the user has access to
 * @access  Private (requires valid access token)
 */
router.get('/organizations', profileController.getOrganizations.bind(profileController));

/**
 * @route   GET /api/linkedin/profile/organizations/:organizationId/validate
 * @desc    Validate access to a specific organization
 * @access  Private (requires valid access token)
 */
router.get('/organizations/:organizationId/validate', profileController.validateOrganizationAccess.bind(profileController));

export default router;
