import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config';
import { Logger } from '../utils/logger';
import {
  TokenResponse,
  LinkedInProfile,
  LinkedInPostRequest,
  LinkedInImagePostRequest,
  LinkedInArticlePostRequest,
  LinkedInPost,
  LinkedInOrganization,
  MediaUploadResponse,
  LinkedInMediaPostRequest,
  LinkedInVideoPostRequest,
} from '../types';

export class LinkedInService {
  private axiosInstance: AxiosInstance;
  private accessToken: string;
  private refreshToken: string;

  constructor() {
    this.accessToken = config.linkedin.accessToken;
    this.refreshToken = config.linkedin.refreshToken;

    this.axiosInstance = axios.create({
      baseURL: config.linkedin.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    // Set initial authorization header
    this.updateAuthorizationHeader();
  }

  private updateAuthorizationHeader(): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
  }

  /**
   * Generate LinkedIn OAuth authorization URL
   */
  getAuthorizationUrl(redirectUri: string, state: string, scope: string = 'openid profile email w_member_social w_organization_social'): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.linkedin.clientId,
      redirect_uri: redirectUri,
      state,
      scope,
    });

    return `${config.linkedin.authUrl}/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.linkedin.clientId,
        client_secret: config.linkedin.clientSecret,
      });

      const response = await axios.post<TokenResponse>(
        `${config.linkedin.authUrl}/accessToken`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Update stored tokens
      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }
      this.updateAuthorizationHeader();

      Logger.info('Access token obtained successfully');
      return response.data;
    } catch (error) {
      Logger.error('Failed to get access token', error);
      throw this.handleError(error);
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: config.linkedin.clientId,
        client_secret: config.linkedin.clientSecret,
      });

      const response = await axios.post<TokenResponse>(
        `${config.linkedin.authUrl}/accessToken`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Update stored tokens
      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }
      this.updateAuthorizationHeader();

      Logger.info('Access token refreshed successfully');
      return response.data;
    } catch (error) {
      Logger.error('Failed to refresh access token', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify if the current access token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get authenticated user's profile
   */
  async getUserProfile(): Promise<LinkedInProfile> {
    try {
      const response = await this.axiosInstance.get('/v2/userinfo');

      const profile: LinkedInProfile = {
        id: response.data.sub,
        firstName: response.data.given_name || '',
        lastName: response.data.family_name || '',
        email: response.data.email,
        profilePicture: response.data.picture,
      };

      Logger.info('User profile retrieved successfully');
      return profile;
    } catch (error) {
      Logger.error('Failed to get user profile', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get the user's LinkedIn URN (person ID)
   */
  async getUserUrn(): Promise<string> {
    try {
      const response = await this.axiosInstance.get('/v2/userinfo');
      return response.data.sub;
    } catch (error) {
      Logger.error('Failed to get user URN', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get organizations the user has access to
   */
  async getOrganizations(): Promise<LinkedInOrganization[]> {
    try {
      // Try the organization access API
      const response = await this.axiosInstance.get('/v2/organizationAcls?q=roleAssignee');

      const organizations: LinkedInOrganization[] = response.data.elements?.map((acl: any) => ({
        id: acl.organization?.replace('urn:li:organization:', '') || acl.organization,
        name: acl.organizationName || `Organization ${acl.organization}`,
        vanityName: acl.organizationVanityName,
        localizedName: acl.organizationName,
      })) || [];

      Logger.info(`Retrieved ${organizations.length} organizations`);
      return organizations;
    } catch (error) {
      Logger.warn('Organizations API failed, returning empty array', error instanceof Error ? error.message : String(error));
      // Return empty array instead of throwing error
      return [];
    }
  }

  /**
   * Get organizations with detailed debug information
   */
  async getOrganizationsWithDebug(): Promise<{ organizations: LinkedInOrganization[], debug: any }> {
    try {
      // Try the organization access API
      const response = await this.axiosInstance.get('/v2/organizationAcls?q=roleAssignee');

      const organizations: LinkedInOrganization[] = response.data.elements?.map((acl: any) => ({
        id: acl.organization?.replace('urn:li:organization:', '') || acl.organization,
        name: acl.organizationName || `Organization ${acl.organization}`,
        vanityName: acl.organizationVanityName,
        localizedName: acl.organizationName,
      })) || [];

      Logger.info(`Retrieved ${organizations.length} organizations`);
      
      return {
        organizations,
        debug: {
          apiCallSuccessful: true,
          responseStatus: response.status,
          elementsCount: response.data.elements?.length || 0,
          rawElements: response.data.elements || [],
          hasOrganizationAdminAccess: organizations.length > 0,
          message: organizations.length === 0 
            ? 'No organizations found. This means you are not an admin of any LinkedIn company pages, or your access token does not have w_organization_social scope.' 
            : `Found ${organizations.length} organization(s) where you have admin access.`
        }
      };
    } catch (error: any) {
      Logger.warn('Organizations API failed', error);
      
      let errorDetails: any = {
        apiCallSuccessful: false,
        errorOccurred: true,
        message: 'Failed to fetch organizations from LinkedIn API'
      };

      if (axios.isAxiosError(error)) {
        errorDetails = {
          ...errorDetails,
          httpStatus: error.response?.status,
          httpStatusText: error.response?.statusText,
          errorMessage: error.message,
          linkedInError: error.response?.data,
          possibleReasons: [
            'Access token does not have w_organization_social scope',
            'Access token is expired or invalid',
            'You are not an admin of any LinkedIn company pages',
            'LinkedIn API endpoint may have changed'
          ]
        };
      } else {
        errorDetails.error = error.message;
      }

      return {
        organizations: [],
        debug: errorDetails
      };
    }
  }

  /**
   * Create a text post on LinkedIn
   */
  async createTextPost(postData: LinkedInPostRequest): Promise<LinkedInPost> {
    try {
      let authorUrn: string;

      if (postData.organizationId) {
        // Post to organization page
        authorUrn = `urn:li:organization:${postData.organizationId}`;
      } else {
        // Post to personal profile
        authorUrn = `urn:li:person:${await this.getUserUrn()}`;
      }

      const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postData.text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility || 'PUBLIC',
        },
      };

      const response = await this.axiosInstance.post('/v2/ugcPosts', payload);

      Logger.info('Text post created successfully', {
        postId: response.data.id,
        author: authorUrn,
        isOrganization: !!postData.organizationId
      });
      return response.data;
    } catch (error) {
      Logger.error('Failed to create text post', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create an image post on LinkedIn
   */
  async createImagePost(postData: LinkedInImagePostRequest): Promise<LinkedInPost> {
    try {
      let authorUrn: string;

      if (postData.organizationId) {
        // Post to organization page
        authorUrn = `urn:li:organization:${postData.organizationId}`;
      } else {
        // Post to personal profile
        authorUrn = `urn:li:person:${await this.getUserUrn()}`;
      }

      // First, register the image upload
      const registerUploadResponse = await this.registerImageUpload(authorUrn);
      // const uploadUrl = registerUploadResponse.uploadUrl; // Reserved for future image upload implementation
      const asset = registerUploadResponse.asset;

      // Upload the image (this would require actual image binary data)
      // For now, we'll assume the image is already uploaded or use the URL directly
      
      const payload = {
        author: `urn:li:person:${authorUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postData.text,
            },
            shareMediaCategory: 'IMAGE',
            media: [
              {
                status: 'READY',
                description: {
                  text: postData.imageDescription || '',
                },
                media: asset,
                title: {
                  text: 'Image Post',
                },
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility || 'PUBLIC',
        },
      };

      const response = await this.axiosInstance.post('/v2/ugcPosts', payload);

      Logger.info('Image post created successfully', { postId: response.data.id });
      return response.data;
    } catch (error) {
      Logger.error('Failed to create image post', error);
      throw this.handleError(error);
    }
  }

  /**
   * Register an image upload with LinkedIn
   */
  async registerImageUpload(authorUrn: string): Promise<MediaUploadResponse> {
    const payload = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
      },
    };

    const response = await this.axiosInstance.post('/v2/assets?action=registerUpload', payload);

    return {
      uploadUrl: response.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
      asset: response.data.value.asset,
    };
  }

  /**
   * Register a video upload with LinkedIn
   */
  async registerVideoUpload(authorUrn: string): Promise<MediaUploadResponse> {
    const payload = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
      },
    };

    const response = await this.axiosInstance.post('/v2/assets?action=registerUpload', payload);

    return {
      uploadUrl: response.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
      asset: response.data.value.asset,
    };
  }

  /**
   * Upload binary image data to LinkedIn
   */
  async uploadImageBinary(uploadUrl: string, imageBuffer: Buffer): Promise<void> {
    try {
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      Logger.info('Image uploaded successfully');
    } catch (error) {
      Logger.error('Failed to upload image binary', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload binary video data to LinkedIn
   */
  async uploadVideoBinary(uploadUrl: string, videoBuffer: Buffer): Promise<void> {
    try {
      await axios.put(uploadUrl, videoBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      Logger.info('Video uploaded successfully');
    } catch (error) {
      Logger.error('Failed to upload video binary', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a post with binary image upload
   */
  async createImagePostWithBinary(postData: LinkedInMediaPostRequest, imageBuffer: Buffer): Promise<LinkedInPost> {
    try {
      let authorUrn: string;

      if (postData.organizationId) {
        authorUrn = `urn:li:organization:${postData.organizationId}`;
      } else {
        authorUrn = `urn:li:person:${await this.getUserUrn()}`;
      }

      // Register the upload
      const { uploadUrl, asset } = await this.registerImageUpload(authorUrn);

      // Upload the binary data
      await this.uploadImageBinary(uploadUrl, imageBuffer);

      // Create the post
      const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postData.text,
            },
            shareMediaCategory: 'IMAGE',
            media: [
              {
                status: 'READY',
                description: {
                  text: postData.mediaDescription || '',
                },
                media: asset,
                title: {
                  text: 'Image Post',
                },
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility || 'PUBLIC',
        },
      };

      const response = await this.axiosInstance.post('/v2/ugcPosts', payload);

      Logger.info('Image post with binary created successfully', {
        postId: response.data.id,
        author: authorUrn,
        isOrganization: !!postData.organizationId,
      });
      return response.data;
    } catch (error) {
      Logger.error('Failed to create image post with binary', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a post with binary video upload
   */
  async createVideoPostWithBinary(postData: LinkedInVideoPostRequest, videoBuffer: Buffer): Promise<LinkedInPost> {
    try {
      let authorUrn: string;

      if (postData.organizationId) {
        authorUrn = `urn:li:organization:${postData.organizationId}`;
      } else {
        authorUrn = `urn:li:person:${await this.getUserUrn()}`;
      }

      // Register the upload
      const { uploadUrl, asset } = await this.registerVideoUpload(authorUrn);

      // Upload the binary data
      await this.uploadVideoBinary(uploadUrl, videoBuffer);

      // Create the post
      const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postData.text,
            },
            shareMediaCategory: 'VIDEO',
            media: [
              {
                status: 'READY',
                description: {
                  text: postData.videoDescription || '',
                },
                media: asset,
                title: {
                  text: 'Video Post',
                },
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility || 'PUBLIC',
        },
      };

      const response = await this.axiosInstance.post('/v2/ugcPosts', payload);

      Logger.info('Video post with binary created successfully', {
        postId: response.data.id,
        author: authorUrn,
        isOrganization: !!postData.organizationId,
      });
      return response.data;
    } catch (error) {
      Logger.error('Failed to create video post with binary', error);
      throw this.handleError(error);
    }
  }

  /**
   * Share an article/link on LinkedIn
   */
  async createArticlePost(postData: LinkedInArticlePostRequest): Promise<LinkedInPost> {
    try {
      let authorUrn: string;

      if (postData.organizationId) {
        // Post to organization page
        authorUrn = `urn:li:organization:${postData.organizationId}`;
      } else {
        // Post to personal profile
        authorUrn = `urn:li:person:${await this.getUserUrn()}`;
      }

      const payload = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postData.text,
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text: postData.articleDescription || '',
                },
                originalUrl: postData.articleUrl,
                title: {
                  text: postData.articleTitle || 'Shared Article',
                },
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': postData.visibility || 'PUBLIC',
        },
      };

      const response = await this.axiosInstance.post('/v2/ugcPosts', payload);

      Logger.info('Article post created successfully', { postId: response.data.id });
      return response.data;
    } catch (error) {
      Logger.error('Failed to create article post', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate if user can post to an organization
   */
  async validateOrganizationAccess(organizationId: string): Promise<boolean> {
    try {
      // Try to get organization details to validate access
      const response = await this.axiosInstance.get(`/v2/organizations/${organizationId}`);

      Logger.info('Organization access validated', { organizationId, name: response.data.localizedName });
      return true;
    } catch (error) {
      Logger.warn('Organization access validation failed', {
        organizationId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Handle axios errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data || axiosError.message;
      const status = axiosError.response?.status;

      Logger.error(`LinkedIn API Error (${status}):`, message);
      return new Error(`LinkedIn API Error: ${JSON.stringify(message)}`);
    }
    return error;
  }
}

export default new LinkedInService();
