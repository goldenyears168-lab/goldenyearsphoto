/**
 * 統一錯誤處理中間件
 * 捕獲所有錯誤並回傳友善的錯誤訊息
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * 創建應用錯誤
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  isOperational: boolean = true
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};

/**
 * 錯誤處理中間件
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appError = err as AppError;
  const statusCode = appError.statusCode || 500;
  const isOperational = appError.isOperational !== false;

  // 記錄錯誤
  logger.logError(err, {
    path: req.path,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress,
    statusCode,
    isOperational,
  });

  // 嚴重錯誤觸發告警（這裡可以整合 Sentry 或其他告警系統）
  if (statusCode === 500 || (statusCode === 429 && !isOperational)) {
    // TODO: 整合告警系統（Sentry、Email、Slack 等）
    logger.error('Critical error occurred', {
      error: err.message,
      stack: err.stack,
    });
  }

  // 回傳錯誤回應
  if (isOperational) {
    // 可預期的錯誤（4xx）
    res.status(statusCode).json({
      error: appError.message || '請求處理失敗',
      message: getFriendlyErrorMessage(statusCode),
    });
  } else {
    // 未預期的錯誤（5xx）
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production'
        ? '伺服器發生錯誤，請稍後再試。如有緊急需求，請透過 Email 或電話聯絡我們。'
        : err.message,
    });
  }
};

/**
 * 取得友善的錯誤訊息
 */
function getFriendlyErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: '請求格式錯誤，請檢查後重試',
    401: '未授權的請求',
    403: '請求被拒絕',
    404: '找不到請求的資源',
    429: '請求過於頻繁，請稍後再試',
    500: '伺服器發生錯誤，請稍後再試',
    503: '服務暫時無法使用，請稍後再試',
  };

  return messages[statusCode] || '發生錯誤，請稍後再試';
}

/**
 * 處理未捕獲的路由
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress,
  });

  res.status(404).json({
    error: 'Not Found',
    message: '找不到請求的端點',
  });
};

