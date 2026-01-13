import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { Logger } from './utils/logger';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: '*', // Configure this based on your needs
      credentials: true,
    }));

    // Request logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    this.app.use('/api/', apiLimiter);

    Logger.info('Middlewares initialized');
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    Logger.info('Routes initialized');
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    Logger.info('Error handling initialized');
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      Logger.info(`🚀 Server is running on port ${port}`);
      Logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      Logger.info(`🔗 API URL: http://localhost:${port}/api`);
    });
  }
}
