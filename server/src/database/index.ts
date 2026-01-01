import mysql, { PoolOptions } from 'mysql2/promise';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

const access: PoolOptions = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: Number(config.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  decimalNumbers: true 
};

export const db = mysql.createPool(access);

export const query = async <T>(sql: string, params?: any[]): Promise<T> => {
  try {
    const [rows] = await db.query(sql, params);
    return rows as T;
  } catch (error) {
    logger.error('Database Query Failed', { sql, error });
    throw error;
  }
};

export const checkDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();
    logger.info('Base de données connectée');
    connection.release();
  } catch (error) {
    logger.error('Échec connexion MySQL', error);
    process.exit(1);
  }
};