import 'dotenv/config';
import app from './app';
import { config } from '@/config/env';
import { checkDatabaseConnection, db } from '@/database/index';
import { logger } from '@/utils/logger';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    logger.info('Connecting to MySQL Database...');
    await checkDatabaseConnection();
    
    const server = app.listen(config.PORT, () => {
      logger.info(`
      ################################################
      DEFTER SERVER RUNNING
      URL:   http://localhost:${config.PORT}
      Mode:  ${config.NODE_ENV}
      ################################################
      `);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP Server closed.');
      });

      try {
        await db.end();
        logger.info('MySQL Pool closed.');
      } catch (err) {
        logger.error('Error closing MySQL pool', err);
      }

      logger.info('Goodbye!');
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (err: any) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('Fatal Error during startup:', error);
    process.exit(1);
  }
};

startServer();