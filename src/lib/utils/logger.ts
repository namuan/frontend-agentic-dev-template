type LogContext = Record<string, unknown> | undefined;

type Logger = {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
};

export const logger: Logger = {
  info: (message, context) => {
    if (import.meta.env.DEV) {
      console.warn(`[info] ${message}`, context ?? {});
    }
  },
  warn: (message, context) => {
    console.warn(`[warn] ${message}`, context ?? {});
  },
  error: (message, context) => {
    console.error(`[error] ${message}`, context ?? {});
  },
};
