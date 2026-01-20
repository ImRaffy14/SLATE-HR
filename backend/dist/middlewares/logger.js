"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestLogger = (req, res, next) => {
    const { method, url } = req;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${url}`);
    next();
};
exports.default = requestLogger;
