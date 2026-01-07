import { AppError } from '../../../utils/appError';
import { TrainingType, TrainingStatus } from '@prisma/client';

export class TrainingValidator {
  static validateCreateTraining(data: any): void {
    if (!data.trainingId || typeof data.trainingId !== 'string') {
      throw new AppError('Training ID is required and must be a string', 400);
    }

    if (!data.title || typeof data.title !== 'string') {
      throw new AppError('Title is required and must be a string', 400);
    }

    if (!data.trainingType || !Object.values(TrainingType).includes(data.trainingType)) {
      throw new AppError('Valid training type is required (ONLINE, ONSITE, HYBRID)', 400);
    }

    if (!data.startDate) {
      throw new AppError('Start date is required', 400);
    }

    if (!data.endDate) {
      throw new AppError('End date is required', 400);
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime())) {
      throw new AppError('Invalid start date format', 400);
    }

    if (isNaN(endDate.getTime())) {
      throw new AppError('Invalid end date format', 400);
    }

    if (startDate >= endDate) {
      throw new AppError('End date must be after start date', 400);
    }

    if (!data.durationHours || typeof data.durationHours !== 'number' || data.durationHours <= 0) {
      throw new AppError('Duration hours is required and must be a positive number', 400);
    }

    if (!data.maxParticipants || typeof data.maxParticipants !== 'number' || data.maxParticipants <= 0) {
      throw new AppError('Max participants is required and must be a positive number', 400);
    }

    if (!Array.isArray(data.taggedCompetencies)) {
      throw new AppError('Tagged competencies must be an array', 400);
    }
  }

  static validateUpdateTraining(data: any): void {
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new AppError('Invalid date format', 400);
      }

      if (startDate >= endDate) {
        throw new AppError('End date must be after start date', 400);
      }
    }

    if (data.trainingType && !Object.values(TrainingType).includes(data.trainingType)) {
      throw new AppError('Invalid training type', 400);
    }

    if (data.status && !Object.values(TrainingStatus).includes(data.status)) {
      throw new AppError('Invalid training status', 400);
    }

    if (data.durationHours && (typeof data.durationHours !== 'number' || data.durationHours <= 0)) {
      throw new AppError('Duration hours must be a positive number', 400);
    }

    if (data.maxParticipants && (typeof data.maxParticipants !== 'number' || data.maxParticipants <= 0)) {
      throw new AppError('Max participants must be a positive number', 400);
    }

    if (data.taggedCompetencies && !Array.isArray(data.taggedCompetencies)) {
      throw new AppError('Tagged competencies must be an array', 400);
    }
  }

  static validateEnrollment(data: any): void {
    if (!data.trainingId || typeof data.trainingId !== 'string') {
      throw new AppError('Training ID is required', 400);
    }

    if (!data.employeeId || typeof data.employeeId !== 'string') {
      throw new AppError('Employee ID is required', 400);
    }
  }

  static validateAttendance(data: any): void {
    if (!data.employeeId || typeof data.employeeId !== 'string') {
      throw new AppError('Employee ID is required', 400);
    }

    if (!data.qrData || typeof data.qrData !== 'string') {
      throw new AppError('QR data is required', 400);
    }
  }

  static validateEvaluation(data: any): void {
    if (!data.trainingRating || typeof data.trainingRating !== 'number') {
      throw new AppError('Training rating is required and must be a number', 400);
    }

    if (data.trainingRating < 1 || data.trainingRating > 5) {
      throw new AppError('Training rating must be between 1 and 5', 400);
    }

    if (data.trainerRating !== undefined && data.trainerRating !== null) {
      if (typeof data.trainerRating !== 'number') {
        throw new AppError('Trainer rating must be a number', 400);
      }

      if (data.trainerRating < 1 || data.trainerRating > 5) {
        throw new AppError('Trainer rating must be between 1 and 5', 400);
      }
    }
  }
}

