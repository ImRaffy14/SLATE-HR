import { Request, Response, NextFunction } from 'express';


export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (statusCode >= 500) {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        console.error(`Status: ${statusCode}`);
        console.error(`Message: ${message}`);
        console.error('Stack:', err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: statusCode === 500 ? 'Internal Server Error' : message,
    });
};
