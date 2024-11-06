export const logger = {
  info: (message: string): void => {
    console.log(`ℹ ${message}`);
  },

  success: (message: string): void => {
    console.log(`✓ ${message}`);
  },

  error: (message: string, error?: unknown): void => {
    console.error(
      `✖ ${message}:`,
      error instanceof Error ? error.message : String(error)
    );
  },

  warn: (message: string): void => {
    console.log(`⚠ ${message}`);
  },

  debug: (message: string): void => {
    if (process.env.DEBUG) {
      console.log(`🔍 ${message}`);
    }
  },
};
