import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { DashboardService } from '../services/dashboard.service';
import { CareerPathService } from '../services/careerPath.service';
import { ESSEnrollmentService } from '../services/enrollment.service';
import { AchievementService } from '../services/achievement.service';
import { NotificationService, NotificationType } from '../services/notification.service';

export class ESSController {
  private dashboardService = new DashboardService();
  private careerPathService = new CareerPathService();
  private enrollmentService = new ESSEnrollmentService();
  private achievementService = new AchievementService();
  private notificationService = new NotificationService();

  /**
   * GET /ess/dashboard
   * Get employee dashboard with aggregated data
   */
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    const dashboard = await this.dashboardService.getEmployeeDashboard(employeeId);
    
    res.status(200).json({
      status: 'success',
      dashboard
    });
  });

  /**
   * GET /ess/career-path
   * Get career path with all potential next roles
   */
  getCareerPath = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    const careerPath = await this.careerPathService.getCareerPath(employeeId);
    
    res.status(200).json({
      status: 'success',
      careerPath
    });
  });

  /**
   * GET /ess/career-path/:targetRoleId
   * Get detailed career path for a specific target role
   */
  getCareerPathDetails = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    const targetRoleId = req.params.targetRoleId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    if (!targetRoleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Target role ID is required'
      });
    }

    const careerPathDetails = await this.careerPathService.getCareerPathDetails(
      employeeId,
      targetRoleId
    );
    
    res.status(200).json({
      status: 'success',
      careerPathDetails
    });
  });

  /**
   * POST /ess/enroll/course/:courseId
   * Self-enroll in a course
   */
  enrollInCourse = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    const courseId = req.params.courseId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    if (!courseId) {
      return res.status(400).json({
        status: 'error',
        message: 'Course ID is required'
      });
    }

    const enrollment = await this.enrollmentService.enrollInCourse(employeeId, courseId);
    
    res.status(201).json({
      status: 'success',
      message: 'Successfully enrolled in course',
      enrollment
    });
  });

  /**
   * POST /ess/enroll/training/:trainingId
   * Self-enroll in a training
   */
  enrollInTraining = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    const trainingId = req.params.trainingId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    if (!trainingId) {
      return res.status(400).json({
        status: 'error',
        message: 'Training ID is required'
      });
    }

    const enrollment = await this.enrollmentService.enrollInTraining(employeeId, trainingId);
    
    res.status(201).json({
      status: 'success',
      message: 'Training enrollment request submitted. Awaiting approval.',
      enrollment
    });
  });

  /**
   * POST /ess/upload/achievement
   * Upload achievement/certificate
   */
  uploadAchievement = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File is required'
      });
    }

    const { title, description, competencyId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    const achievement = await this.achievementService.uploadAchievement(
      employeeId,
      req.file,
      {
        title: title.trim(),
        description: description?.trim(),
        competencyId: competencyId?.trim() || undefined
      }
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Achievement uploaded successfully. Awaiting HR/Manager approval.',
      achievement
    });
  });

  /**
   * GET /ess/notifications
   * Get employee notifications
   */
  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    const filters = {
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      type: req.query.type ? (req.query.type as NotificationType) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.notificationService.getEmployeeNotifications(employeeId, filters);
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  /**
   * PATCH /ess/notifications/:id/read
   * Mark notification as read
   */
  markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employeeId;
    const notificationId = req.params.id;
    
    if (!employeeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID is required'
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        status: 'error',
        message: 'Notification ID is required'
      });
    }

    const notification = await this.notificationService.markNotificationRead(
      notificationId,
      employeeId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      notification
    });
  });
}

