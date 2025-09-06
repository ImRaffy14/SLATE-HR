import { Request, Response } from "express";
import { TrainingService } from "../services/training.service";
import { asyncHandler } from "../utils/asyncHandler";

export class TrainingController {
  private trainingService = new TrainingService();

  // Create a training session
  createTrainingSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await this.trainingService.createTrainingSessionService(req.body);
    res.status(201).json({
      status: "success",
      message: "Training session created successfully",
      session,
    });
  });

  // Get all training sessions
  getAllTrainingSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await this.trainingService.getAllTrainingSessionsService();
    res.status(200).json({
      status: "success",
      sessions,
    });
  });

  // Get training session by ID
  getTrainingSessionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = await this.trainingService.getTrainingSessionByIdService(id);
    res.status(200).json({
      status: "success",
      session,
    });
  });

  // Update training session
  updateTrainingSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await this.trainingService.updateTrainingSessionService(id, req.body);
    res.status(200).json({
      status: "success",
      message: "Training session updated successfully",
      session: updated,
    });
  });

  // Delete training session
  deleteTrainingSession = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await this.trainingService.deleteTrainingSessionService(id);
    res.status(200).json({
      status: "success",
      message: "Training session deleted successfully",
      session: deleted,
    });
  });

  // =======================
  // Training Records
  // =======================

  // Add a training record (attendance, completion)
  addTrainingRecord = asyncHandler(async (req: Request, res: Response) => {
    const record = await this.trainingService.addTrainingRecordService(req.body);
    res.status(201).json({
      status: "success",
      message: "Training record added successfully",
      record,
    });
  });

  // Get training records for a session
  getRecordsBySession = asyncHandler(async (req: Request, res: Response) => {
    const { trainingId } = req.params;
    const records = await this.trainingService.getRecordsBySessionService(trainingId);
    res.status(200).json({
      status: "success",
      records,
    });
  });

  // Get training records for an employee
  getRecordsByEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const records = await this.trainingService.getRecordsByEmployeeService(employeeId);
    res.status(200).json({
      status: "success",
      records,
    });
  });

  // Update a training record
  updateTrainingRecord = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await this.trainingService.updateTrainingRecordService(id, req.body);
    res.status(200).json({
      status: "success",
      message: "Training record updated successfully",
      record: updated,
    });
  });
}
