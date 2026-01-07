"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'User role not found. Please authenticate first.'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to access this resource.'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
