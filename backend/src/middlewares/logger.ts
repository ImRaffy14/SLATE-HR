import { Request, Response, NextFunction } from 'express';

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url}`);
  next();
};

export default requestLogger;
