import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import hpp from 'hpp';

import { config } from '@/config/env';
import { AppError } from '@/utils/AppError';
import { errorHandler } from '@/middlewares/error.middleware';
import { logger } from '@/utils/logger';
import routes from '@/routes';

const app: Application = express();

app.enable('trust proxy');
app.use(helmet());

app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

const logFormat = config.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(logFormat, {
  stream: { write: (message) => logger.info(message.trim()) },
  skip: (req) => req.url === '/api/v1/health'
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api', limiter);

app.use(hpp());
app.use(compression());

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/v1', routes);

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Captures ALL errors (AppError, SyntaxError, DatabaseError...)
app.use(errorHandler);

export default app;