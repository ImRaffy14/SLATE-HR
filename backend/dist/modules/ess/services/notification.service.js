"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
class NotificationService {
    /**
     * Create a notification for an employee
     */
    async createNotification(employeeId, type, message, metadata) {
        // Verify employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        return prisma_1.default.notification.create({
            data: {
                employeeId,
                type,
                message,
                metadata: metadata || null,
                isRead: false
            }
        });
    }
    /**
     * Get notifications for an employee with pagination and filters
     */
    async getEmployeeNotifications(employeeId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        const where = {
            employeeId
        };
        if (filters?.isRead !== undefined) {
            where.isRead = filters.isRead;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        const [notifications, total] = await Promise.all([
            prisma_1.default.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma_1.default.notification.count({ where })
        ]);
        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Mark a notification as read
     */
    async markNotificationRead(notificationId, employeeId) {
        // Verify notification belongs to employee
        const notification = await prisma_1.default.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification) {
            throw new appError_1.AppError('Notification not found', 404);
        }
        if (notification.employeeId !== employeeId) {
            throw new appError_1.AppError('Unauthorized access to notification', 403);
        }
        if (notification.isRead) {
            return notification; // Already read, return as is
        }
        return prisma_1.default.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true
            }
        });
    }
    /**
     * Get unread notification count for an employee
     */
    async getUnreadCount(employeeId) {
        return prisma_1.default.notification.count({
            where: {
                employeeId,
                isRead: false
            }
        });
    }
}
exports.NotificationService = NotificationService;
