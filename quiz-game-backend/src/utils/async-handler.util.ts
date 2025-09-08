import { NextFunction, Request, Response } from 'express';

/**
 * Обертка для асинхронных обработчиков маршрутов
 * Автоматически перехватывает ошибки и передает их в middleware обработки ошибок
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
