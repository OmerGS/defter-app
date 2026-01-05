import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { config } from '@/config/env';

/**
 * Definition of log levels priorities.
 * Follows RFC5424 standard.
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Colors configuration for Development mode console output.
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Custom Format for Production: JSON (Structured Logging).
 * Essential for log aggregation tools.
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Custom Format for Development: Readable text with colors.
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
);

/**
 * Base Transports (Console + Local Files)
 */
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.NODE_ENV === 'development' ? developmentFormat : productionFormat,
  }),

  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: productionFormat,
  }),

  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: productionFormat,
  }),
];

/**
 * CLOUD LOGGING INTEGRATION (Better Stack / Logtail)
 * Only active if the token is present in .env
 */
if (config.LOGTAIL_SOURCE_TOKEN) {
  const logtail = new Logtail(config.LOGTAIL_SOURCE_TOKEN);
  transports.push(new LogtailTransport(logtail));
}

/**
 * The Logger Instance.
 */
export const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports,
});