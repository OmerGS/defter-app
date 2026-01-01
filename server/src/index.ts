import app from './app';
import { config } from './config/env';
import { checkDatabaseConnection, db } from '@/database/index';

const startServer = async () => {
  try {
    console.log('Connecting to Database...');
    await checkDatabaseConnection();
    console.log('Database Connected.');

    const server = app.listen(config.PORT, () => {
      console.log(`
      ################################################
      DEFTER SERVER STARTED / URL:    http://localhost:${config.PORT}
      MODE:   ${config.NODE_ENV}
      ################################################
      `);
    });

    const shutdown = async () => {
      console.log('\nSIGTERM/SIGINT received. Shutting down...');
      
      server.close(() => {
        console.log('HTTP Server closed.');
      });

      await db.end();
      console.log('MySQL Pool closed.');
      
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Fatal Error during startup:', error);
    process.exit(1);
  }
};

startServer();