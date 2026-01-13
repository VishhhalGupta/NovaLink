import { Request, Response } from 'express';
import linkedInService from '../services/linkedin.service';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';

export class LinkedInAuthController {
  /**
   * Get LinkedIn authorization URL
   */
  async getAuthorizationUrl(req: Request, res: Response): Promise<Response | void> {
    try {
      const { redirectUri, state, scope } = req.query;

      if (!redirectUri || !state) {
        return errorResponse(res, 'Missing required parameters: redirectUri and state', 400);
      }

      const authUrl = linkedInService.getAuthorizationUrl(
        redirectUri as string,
        state as string,
        scope as string | undefined
      );

      Logger.info('Authorization URL generated');
      return successResponse(res, 'Authorization URL generated successfully', { authUrl });
    } catch (error: any) {
      Logger.error('Error generating authorization URL', error);
      return errorResponse(res, 'Failed to generate authorization URL', 500, error.message);
    }
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(req: Request, res: Response): Promise<Response | void> {
    try {
      const { code, redirectUri } = req.body;

      if (!code || !redirectUri) {
        return errorResponse(res, 'Missing required parameters: code and redirectUri', 400);
      }

      const tokenData = await linkedInService.getAccessToken(code, redirectUri);

      Logger.info('OAuth callback handled successfully');
      return successResponse(res, 'Access token obtained successfully', tokenData);
    } catch (error: any) {
      Logger.error('Error handling OAuth callback', error);
      return errorResponse(res, 'Failed to obtain access token', 500, error.message);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(_req: Request, res: Response): Promise<Response | void> {
    try {
      const tokenData = await linkedInService.refreshAccessToken();

      Logger.info('Access token refreshed');
      return successResponse(res, 'Access token refreshed successfully', tokenData);
    } catch (error: any) {
      Logger.error('Error refreshing token', error);
      return errorResponse(res, 'Failed to refresh access token', 500, error.message);
    }
  }

  /**
   * Verify current access token
   */
  async verifyToken(_req: Request, res: Response): Promise<Response | void> {
    try {
      const isValid = await linkedInService.verifyToken();

      if (isValid) {
        return successResponse(res, 'Access token is valid', { valid: true });
      } else {
        return errorResponse(res, 'Access token is invalid or expired', 401);
      }
    } catch (error: any) {
      Logger.error('Error verifying token', error);
      return errorResponse(res, 'Failed to verify access token', 500, error.message);
    }
  }
}

export default new LinkedInAuthController();
