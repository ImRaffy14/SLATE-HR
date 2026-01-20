"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeAuth = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
/**
 * Middleware to verify employee access
 * Requires bearerAuth to run first (sets req.user)
 * Verifies user has employeeId linked and employee exists and is ACTIVE
 */
const employeeAuth = async (req, res, next) => {
    // This middleware must run after bearerAuth
    if (!req.user || !req.userId) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required. Please authenticate first.'
        });
        return;
    }
    try {
        // Fetch user with employeeId
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, role: true, employeeId: true }
        });
        if (!user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            });
            return;
        }
        // Check if user has EMPLOYEE role OR has employeeId linked
        if (user.role !== client_1.UserRole.EMPLOYEE && !user.employeeId) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied. Employee access required.'
            });
            return;
        }
        // If user has employeeId, verify employee exists and is ACTIVE
        if (user.employeeId) {
            const employee = await prisma_1.default.employee.findUnique({
                where: { id: user.employeeId },
                select: { id: true, status: true }
            });
            if (!employee) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Employee record not found'
                });
                return;
            }
            if (employee.status !== 'ACTIVE') {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'Employee account is not active'
                });
                return;
            }
            // Set employeeId on request
            req.employeeId = employee.id;
        }
        else if (user.role === client_1.UserRole.EMPLOYEE) {
            // If user has EMPLOYEE role but no employeeId linked, reject
            res.status(403).json({
                error: 'Forbidden',
                message: 'Employee record not linked to user account. Please contact HR to link your employee record to your user account.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Employee authentication error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify employee access'
        });
    }
};
exports.employeeAuth = employeeAuth;
