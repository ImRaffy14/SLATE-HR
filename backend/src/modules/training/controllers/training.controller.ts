import { Request, Response } from 'express';
import { TrainingService } from '../services/training.service';
import { asyncHandler } from '../../../utils/asyncHandler';
import prisma from '../../../config/prisma';

export class TrainingController {
  private trainingService = new TrainingService();

  // Create training
  createTraining = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const training = await this.trainingService.createTraining(req.body, userId);
    res.status(201).json({ status: 'success', training });
  });

  // Get all trainings
  getTrainings = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as any,
      trainingType: req.query.trainingType as any,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      trainerId: req.query.trainerId as string,
      venueId: req.query.venueId as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.trainingService.getTrainings(filters);
    res.status(200).json({ status: 'success', ...result });
  });

  // Get training by ID
  getTrainingById = asyncHandler(async (req: Request, res: Response) => {
    const training = await this.trainingService.getTrainingById(req.params.id);
    res.status(200).json({ status: 'success', training });
  });

  // Update training
  updateTraining = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const training = await this.trainingService.updateTraining(req.params.id, req.body, userId);
    res.status(200).json({ status: 'success', training });
  });

  // Delete training
  deleteTraining = asyncHandler(async (req: Request, res: Response) => {
    await this.trainingService.deleteTraining(req.params.id);
    res.status(200).json({ status: 'success', message: 'Training deleted successfully' });
  });

  // Auto-suggest trainings for employee
  suggestTrainings = asyncHandler(async (req: Request, res: Response) => {
    const trainings = await this.trainingService.suggestTrainingsForEmployee(req.params.employeeId);
    res.status(200).json({ status: 'success', trainings });
  });

  // Get all trainers
  getTrainers = asyncHandler(async (req: Request, res: Response) => {
    const trainers = await prisma.trainer.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: 'success', trainers });
  });

  // Get all venues
  getVenues = asyncHandler(async (req: Request, res: Response) => {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: 'success', venues });
  });
}

