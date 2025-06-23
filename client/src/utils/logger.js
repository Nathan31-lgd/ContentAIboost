// Logger simple pour le frontend
export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.log('[INFO]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args) => {
    if (import.meta.env.DEV) {
      console.debug('[DEBUG]', ...args);
    }
  }
}; 