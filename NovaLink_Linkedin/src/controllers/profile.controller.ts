import { Request, Response } from 'express';
import linkedInService from '../services/linkedin.service';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';

export class LinkedInProfileController {
  /**
   * Get authenticated user's profile
   */
  async getProfile(_req: Request, res: Response): Promise<Response | void> {
    try {
      const profile = await linkedInService.getUserProfile();

      Logger.info('User profile retrieved');
      return successResponse(res, 'Profile retrieved successfully', profile);
    } catch (error: any) {
      Logger.error('Error retrieving profile', error);
      return errorResponse(res, 'Failed to retrieve profile', 500, error.message);
    }
  }

  /**
   * Get organizations the user has access to
   */
  async getOrganizations(_req: Request, res: Response): Promise<Response | void> {
    try {
      const result = await linkedInService.getOrganizationsWithDebug();

      Logger.info('Organizations retrieved', { count: result.organizations.length });
      return successResponse(res, 'Organizations retrieved successfully', result);
    } catch (error: any) {
      Logger.error('Error retrieving organizations', error);
      return errorResponse(res, 'Failed to retrieve organizations', 500, error.message);
    }
  }

  /**
   * Validate organization access
   */
  async validateOrganizationAccess(req: Request, res: Response): Promise<Response | void> {
    try {
      const { organizationId } = req.params;

      if (!organizationId) {
        return errorResponse(res, 'Organization ID is required', 400);
      }

      const hasAccess = await linkedInService.validateOrganizationAccess(organizationId);

      if (hasAccess) {
        return successResponse(res, 'Organization access validated', { organizationId, hasAccess: true });
      } else {
        return errorResponse(res, 'No access to this organization or organization does not exist', 403);
      }
    } catch (error: any) {
      Logger.error('Error validating organization access', error);
      return errorResponse(res, 'Failed to validate organization access', 500, error.message);
    }
  }
}

export default new LinkedInProfileController();
