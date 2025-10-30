import { LogLevel, LogData } from "../interfaces";

class Logger {
  private log(level: LogLevel, message: string, data?: LogData): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console[level === 'error' ? 'error' : 'log'](logMessage, data);
    } else {
      console[level === 'error' ? 'error' : 'log'](logMessage);
    }
  }

  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data as LogData);
  }

  debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, data);
    }
  }
}

export const logger = new Logger();
