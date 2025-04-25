import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Environment variable that determines whether logging is enabled
const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (LOG_ENABLED && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: LOG_ENABLED
    ? [
        // Write logs to file when logging is enabled
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
        }),
      ]
    : [],
  silent: !LOG_ENABLED, // Disable logging when LOG_ENABLED is false
});

// Add console transport for development environment
if (process.env.NODE_ENV !== 'production' && LOG_ENABLED) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
  );
}

// Export wrapper functions to match console.log and console.error
export const log = (message: any, ...args: any[]): void => {
  if (LOG_ENABLED) {
    if (typeof message === 'object') {
      logger.info(JSON.stringify(message));
    } else {
      logger.info(message, ...args);
    }
  }
};

export const error = (message: any, ...args: any[]): void => {
  if (LOG_ENABLED) {
    if (typeof message === 'object') {
      logger.error(JSON.stringify(message));
    } else {
      logger.error(message, ...args);
    }
  }
};

export const info = (message: any, ...args: any[]): void => {
  if (LOG_ENABLED) {
    if (typeof message === 'object') {
      logger.info(JSON.stringify(message));
    } else {
      logger.info(message, ...args);
    }
  }
};

export const debug = (message: any, ...args: any[]): void => {
  if (LOG_ENABLED) {
    if (typeof message === 'object') {
      logger.debug(JSON.stringify(message));
    } else {
      logger.debug(message, ...args);
    }
  }
};

export const warn = (message: any, ...args: any[]): void => {
  if (LOG_ENABLED) {
    if (typeof message === 'object') {
      logger.warn(JSON.stringify(message));
    } else {
      logger.warn(message, ...args);
    }
  }
};

// Export the Winston logger instance for advanced usage
export default logger;
