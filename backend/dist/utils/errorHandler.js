"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
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
exports.errorHandler = errorHandler;
