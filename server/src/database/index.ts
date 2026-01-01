import mysql from 'mysql2/promise';
import { config } from '@/config/env';

export const db = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: Number(config.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
});

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const connection = await db.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('DB Connection Failed:', error);
    throw error; 
  }
};