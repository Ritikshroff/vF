/**
 * Structured Logger
 *
 * Lightweight structured logger for the Viralfluencer platform.
 * - Outputs JSON in production, pretty-printed in development
 * - Includes timestamp, level, message, and optional metadata
 * - Supports child loggers for request correlation
 * - Zero external dependencies (uses console.log/error under the hood)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private context: Record<string, unknown>;
  private minLevel: LogLevel;

  constructor(context: Record<string, unknown> = {}, minLevel?: LogLevel) {
    this.context = context;
    this.minLevel = minLevel ?? (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  }

  /**
   * Create a child logger that inherits context from the parent.
   * Useful for attaching request IDs or other correlation data.
   *
   * @example
   * const reqLogger = logger.child({ requestId: 'abc-123' });
   * reqLogger.info('Processing request');
   */
  child(context: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...context }, this.minLevel);
  }

  /**
   * Log a debug message. Only output in development by default.
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  /**
   * Log an informational message.
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  /**
   * Log a warning message.
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  /**
   * Log an error message.
   */
  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  /**
   * Internal log method that builds the entry and dispatches to the console.
   */
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...meta,
    };

    const isProduction = process.env.NODE_ENV === 'production';
    const output = isProduction ? JSON.stringify(entry) : this.prettyPrint(entry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  /**
   * Format a log entry for human-readable development output.
   */
  private prettyPrint(entry: LogEntry): string {
    const { timestamp, level, message, ...rest } = entry;
    const color = LOG_LEVEL_COLORS[level];
    const levelTag = `${color}[${level.toUpperCase()}]${RESET_COLOR}`;
    const time = timestamp.split('T')[1]; // HH:MM:SS.sssZ

    const metaKeys = Object.keys(rest);
    const metaStr =
      metaKeys.length > 0
        ? `\n  ${JSON.stringify(rest, null, 2).replace(/\n/g, '\n  ')}`
        : '';

    return `${color}${time}${RESET_COLOR} ${levelTag} ${message}${metaStr}`;
  }
}

/** Default logger instance for the application. */
export const logger = new Logger();

export { Logger };
export type { LogLevel, LogEntry };
