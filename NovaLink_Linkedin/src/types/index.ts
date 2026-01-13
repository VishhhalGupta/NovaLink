export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
}

export interface LinkedInOrganization {
  id: string;
  name: string;
  vanityName?: string;
  localizedName?: string;
}

export interface LinkedInPostRequest {
  text: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
  organizationId?: string; // Optional: if provided, post to organization page
}

export interface LinkedInImagePostRequest extends LinkedInPostRequest {
  imageUrl: string;
  imageDescription?: string;
}

export interface LinkedInMediaPostRequest extends LinkedInPostRequest {
  mediaDescription?: string;
}

export interface LinkedInVideoPostRequest extends LinkedInPostRequest {
  videoDescription?: string;
}

export interface LinkedInArticlePostRequest extends LinkedInPostRequest {
  articleUrl: string;
  articleTitle?: string;
  articleDescription?: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface LinkedInPost {
  id: string;
  author: string;
  created: {
    time: number;
  };
  text?: string;
}

export interface MediaUploadResponse {
  uploadUrl: string;
  asset: string;
}

