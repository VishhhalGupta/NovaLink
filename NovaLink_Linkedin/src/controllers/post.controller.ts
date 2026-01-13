import { Request, Response } from 'express';
import linkedInService from '../services/linkedin.service';
import { successResponse, errorResponse } from '../utils/response';
import { Logger } from '../utils/logger';
import {
  LinkedInPostRequest,
  LinkedInImagePostRequest,
  LinkedInArticlePostRequest,
  LinkedInMediaPostRequest,
  LinkedInVideoPostRequest,
} from '../types';

export class LinkedInPostController {
  /**
   * Create a text post
   */
  async createTextPost(req: Request, res: Response): Promise<Response | void> {
    try {
      const postData: LinkedInPostRequest = req.body;

      if (!postData.text) {
        return errorResponse(res, 'Missing required parameter: text', 400);
      }

      const post = await linkedInService.createTextPost(postData);

      Logger.info('Text post created successfully');
      return successResponse(res, 'Text post created successfully', post, 201);
    } catch (error: any) {
      Logger.error('Error creating text post', error);
      return errorResponse(res, 'Failed to create text post', 500, error.message);
    }
  }

  /**
   * Create an image post with URL
   */
  async createImagePost(req: Request, res: Response): Promise<Response | void> {
    try {
      const postData: LinkedInImagePostRequest = req.body;

      if (!postData.text || !postData.imageUrl) {
        return errorResponse(res, 'Missing required parameters: text and imageUrl', 400);
      }

      const post = await linkedInService.createImagePost(postData);

      Logger.info('Image post created successfully');
      return successResponse(res, 'Image post created successfully', post, 201);
    } catch (error: any) {
      Logger.error('Error creating image post', error);
      return errorResponse(res, 'Failed to create image post', 500, error.message);
    }
  }

  /**
   * Create an image post with binary upload
   */
  async createImagePostWithBinary(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.file) {
        return errorResponse(res, 'No image file provided', 400);
      }

      const postData: LinkedInMediaPostRequest = {
        text: req.body.text,
        visibility: req.body.visibility,
        organizationId: req.body.organizationId,
        mediaDescription: req.body.mediaDescription,
      };

      if (!postData.text) {
        return errorResponse(res, 'Missing required parameter: text', 400);
      }

      const post = await linkedInService.createImagePostWithBinary(postData, req.file.buffer);

      Logger.info('Image post with binary created successfully');
      return successResponse(res, 'Image post with binary created successfully', post, 201);
    } catch (error: any) {
      Logger.error('Error creating image post with binary', error);
      return errorResponse(res, 'Failed to create image post with binary', 500, error.message);
    }
  }

  /**
   * Create a video post with binary upload
   */
  async createVideoPostWithBinary(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.file) {
        return errorResponse(res, 'No video file provided', 400);
      }

      const postData: LinkedInVideoPostRequest = {
        text: req.body.text,
        visibility: req.body.visibility,
        organizationId: req.body.organizationId,
        videoDescription: req.body.videoDescription,
      };

      if (!postData.text) {
        return errorResponse(res, 'Missing required parameter: text', 400);
      }

      const post = await linkedInService.createVideoPostWithBinary(postData, req.file.buffer);

      Logger.info('Video post with binary created successfully');
      return successResponse(res, 'Video post with binary created successfully', post, 201);
    } catch (error: any) {
      Logger.error('Error creating video post with binary', error);
      return errorResponse(res, 'Failed to create video post with binary', 500, error.message);
    }
  }

  /**
   * Create an article/link post
   */
  async createArticlePost(req: Request, res: Response): Promise<Response | void> {
    try {
      const postData: LinkedInArticlePostRequest = req.body;

      if (!postData.text || !postData.articleUrl) {
        return errorResponse(res, 'Missing required parameters: text and articleUrl', 400);
      }

      const post = await linkedInService.createArticlePost(postData);

      Logger.info('Article post created successfully');
      return successResponse(res, 'Article post created successfully', post, 201);
    } catch (error: any) {
      Logger.error('Error creating article post', error);
      return errorResponse(res, 'Failed to create article post', 500, error.message);
    }
  }
}

export default new LinkedInPostController();
