import { Request, Response } from 'express';
import { TrainingReportService } from '../services/report.service';
import { asyncHandler } from '../../../utils/asyncHandler';

export class TrainingReportController {
  private reportService = new TrainingReportService();

  // Get training hours report
  getTrainingHoursReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      trainingId: req.query.trainingId as string,
      employeeId: req.query.employeeId as string,
      department: req.query.department as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.reportService.getTrainingHoursReport(filters);
    res.status(200).json({ status: 'success', ...result });
  });

  // Get attendance summary report
  getAttendanceSummaryReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      trainingId: req.query.trainingId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      department: req.query.department as string
    };

    const result = await this.reportService.getAttendanceSummaryReport(filters);
    res.status(200).json({ status: 'success', ...result });
  });

  // Get competency improvement report
  getCompetencyImprovementReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      employeeId: req.query.employeeId as string,
      competencyId: req.query.competencyId as string,
      trainingId: req.query.trainingId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };

    const result = await this.reportService.getCompetencyImprovementReport(filters);
    res.status(200).json({ status: 'success', ...result });
  });

  // Get trainer effectiveness report
  getTrainerEffectivenessReport = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      trainingId: req.query.trainingId as string,
      trainerId: req.query.trainerId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };

    const result = await this.reportService.getTrainerEffectivenessReport(filters);
    res.status(200).json({ status: 'success', trainers: result });
  });
}

