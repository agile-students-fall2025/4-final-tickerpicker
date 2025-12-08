/**
 * Logger utility for conditional logging based on environment
 * In production, only errors are logged to reduce overhead
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
};

