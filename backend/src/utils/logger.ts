/**
 * 日誌記錄工具
 * 記錄所有 API 請求、錯誤和重要事件
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...(metadata && { metadata }),
    };
    return JSON.stringify(entry);
  }

  info(message: string, metadata?: Record<string, any>): void {
    console.log(this.formatLog('info', message, metadata));
  }

  warn(message: string, metadata?: Record<string, any>): void {
    console.warn(this.formatLog('warn', message, metadata));
  }

  error(message: string, metadata?: Record<string, any>): void {
    console.error(this.formatLog('error', message, metadata));
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', message, metadata));
    }
  }

  /**
   * 記錄 API 請求
   */
  logRequest(
    method: string,
    path: string,
    ip: string,
    statusCode: number,
    responseTime?: number
  ): void {
    this.info('API Request', {
      method,
      path,
      ip,
      statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    });
  }

  /**
   * 記錄錯誤
   */
  logError(error: Error, context?: Record<string, any>): void {
    this.error('Error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      ...context,
    });
  }

  /**
   * 記錄 Rate Limit 觸發
   */
  logRateLimit(ip: string, path: string): void {
    this.warn('Rate limit exceeded', {
      ip,
      path,
      action: 'blocked',
    });
  }
}

export const logger = new Logger();

