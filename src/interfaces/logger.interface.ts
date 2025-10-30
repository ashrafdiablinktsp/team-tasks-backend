export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogData {
  [key: string]: unknown;
}
