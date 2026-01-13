import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  linkedin: {
    clientName: string;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    apiVersion: string;
    authUrl: string;
    apiBaseUrl: string;
    accessTokenExpiry: number;
    defaultOrganizationId?: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  linkedin: {
    clientName: process.env.LINKEDIN_CLIENT_NAME || '',
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
    refreshToken: process.env.LINKEDIN_REFRESH_TOKEN || '',
    apiVersion: process.env.LINKEDIN_API_VERSION || 'v2',
    authUrl: process.env.LINKEDIN_AUTH_URL || 'https://www.linkedin.com/oauth/v2',
    apiBaseUrl: process.env.LINKEDIN_API_BASE_URL || 'https://api.linkedin.com',
    accessTokenExpiry: parseInt(process.env.ACCESS_TOKEN_EXPIRY || '5184000', 10),
    defaultOrganizationId: process.env.LINKEDIN_DEFAULT_ORGANIZATION_ID || undefined,
  },
};

// Validate required environment variables
const validateConfig = (): void => {
  const requiredVars = [
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

validateConfig();

export default config;
