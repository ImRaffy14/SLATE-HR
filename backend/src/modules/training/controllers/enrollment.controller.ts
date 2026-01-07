import { Request, Response } from 'express';
import { TrainingEnrollmentService } from '../services/enrollment.service';
import { asyncHandler } from '../../../utils/asyncHandler';
import { EnrollmentType } from '@prisma/client';

export class TrainingEnrollmentController {
  private enrollmentService = new TrainingEnrollmentService();

  // Create enrollment
  createEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { trainingId, employeeId, enrollmentType } = req.body;
    const type = enrollmentType || EnrollmentType.SELF;
    const userId = req.userId || req.user?.id;

    // For manual enrollment (HR/Admin), pass userId as approvedBy
    const approvedBy = type === EnrollmentType.MANUAL ? userId : undefined;

    const enrollment = await this.enrollmentService.createEnrollment(trainingId, employeeId, type, approvedBy);
    res.status(201).json({ status: 'success', enrollment });
  });

  // Get employee's trainings
  getEmployeeTrainings = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.enrollmentService.getEmployeeTrainings(req.params.id, filters);
    res.status(200).json({ status: 'success', ...result });
  });

  // Approve enrollment
  approveEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const enrollment = await this.enrollmentService.approveEnrollment(req.params.id, userId);
    res.status(200).json({ status: 'success', enrollment });
  });

  // Reject enrollment
  rejectEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const { rejectionReason } = req.body;
    const enrollment = await this.enrollmentService.rejectEnrollment(req.params.id, userId, rejectionReason);
    res.status(200).json({ status: 'success', enrollment });
  });

  // Get all enrollments for a training
  getTrainingEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.enrollmentService.getTrainingEnrollments(req.params.trainingId, filters);
    res.status(200).json({ status: 'success', ...result });
  });

  // Get pending enrollments
  getPendingEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      trainingId: req.query.trainingId as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.enrollmentService.getPendingEnrollments(filters);
    res.status(200).json({ status: 'success', ...result });
  });
}

