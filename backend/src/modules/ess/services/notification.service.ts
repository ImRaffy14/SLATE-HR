import prisma from '../../../config/prisma';
import { AppError } from '../../../utils/appError';

export type NotificationType = 
  | 'COURSE_DUE'
  | 'TRAINING_APPROVAL'
  | 'COMPETENCY_UPDATE'
  | 'PROMOTION_READY'
  | 'EVALUATION_REMINDER';

export class NotificationService {
  /**
   * Create a notification for an employee
   */
  async createNotification(
    employeeId: string,
    type: NotificationType,
    message: string,
    metadata?: Record<string, any>
  ) {
    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return prisma.notification.create({
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
  async getEmployeeNotifications(
    employeeId: string,
    filters?: {
      isRead?: boolean;
      type?: NotificationType;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      employeeId
    };

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.notification.count({ where })
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
  async markNotificationRead(notificationId: string, employeeId: string) {
    // Verify notification belongs to employee
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.employeeId !== employeeId) {
      throw new AppError('Unauthorized access to notification', 403);
    }

    if (notification.isRead) {
      return notification; // Already read, return as is
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true
      }
    });
  }

  /**
   * Get unread notification count for an employee
   */
  async getUnreadCount(employeeId: string) {
    return prisma.notification.count({
      where: {
        employeeId,
        isRead: false
      }
    });
  }
}

