"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingValidator = void 0;
const appError_1 = require("../../../utils/appError");
const client_1 = require("@prisma/client");
class TrainingValidator {
    static validateCreateTraining(data) {
        if (!data.trainingId || typeof data.trainingId !== 'string') {
            throw new appError_1.AppError('Training ID is required and must be a string', 400);
        }
        if (!data.title || typeof data.title !== 'string') {
            throw new appError_1.AppError('Title is required and must be a string', 400);
        }
        if (!data.trainingType || !Object.values(client_1.TrainingType).includes(data.trainingType)) {
            throw new appError_1.AppError('Valid training type is required (ONLINE, ONSITE, HYBRID)', 400);
        }
        if (!data.startDate) {
            throw new appError_1.AppError('Start date is required', 400);
        }
        if (!data.endDate) {
            throw new appError_1.AppError('End date is required', 400);
        }
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (isNaN(startDate.getTime())) {
            throw new appError_1.AppError('Invalid start date format', 400);
        }
        if (isNaN(endDate.getTime())) {
            throw new appError_1.AppError('Invalid end date format', 400);
        }
        if (startDate >= endDate) {
            throw new appError_1.AppError('End date must be after start date', 400);
        }
        if (!data.durationHours || typeof data.durationHours !== 'number' || data.durationHours <= 0) {
            throw new appError_1.AppError('Duration hours is required and must be a positive number', 400);
        }
        if (!data.maxParticipants || typeof data.maxParticipants !== 'number' || data.maxParticipants <= 0) {
            throw new appError_1.AppError('Max participants is required and must be a positive number', 400);
        }
        if (!Array.isArray(data.taggedCompetencies)) {
            throw new appError_1.AppError('Tagged competencies must be an array', 400);
        }
    }
    static validateUpdateTraining(data) {
        if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new appError_1.AppError('Invalid date format', 400);
            }
            if (startDate >= endDate) {
                throw new appError_1.AppError('End date must be after start date', 400);
            }
        }
        if (data.trainingType && !Object.values(client_1.TrainingType).includes(data.trainingType)) {
            throw new appError_1.AppError('Invalid training type', 400);
        }
        if (data.status && !Object.values(client_1.TrainingStatus).includes(data.status)) {
            throw new appError_1.AppError('Invalid training status', 400);
        }
        if (data.durationHours && (typeof data.durationHours !== 'number' || data.durationHours <= 0)) {
            throw new appError_1.AppError('Duration hours must be a positive number', 400);
        }
        if (data.maxParticipants && (typeof data.maxParticipants !== 'number' || data.maxParticipants <= 0)) {
            throw new appError_1.AppError('Max participants must be a positive number', 400);
        }
        if (data.taggedCompetencies && !Array.isArray(data.taggedCompetencies)) {
            throw new appError_1.AppError('Tagged competencies must be an array', 400);
        }
    }
    static validateEnrollment(data) {
        if (!data.trainingId || typeof data.trainingId !== 'string') {
            throw new appError_1.AppError('Training ID is required', 400);
        }
        if (!data.employeeId || typeof data.employeeId !== 'string') {
            throw new appError_1.AppError('Employee ID is required', 400);
        }
    }
    static validateAttendance(data) {
        if (!data.employeeId || typeof data.employeeId !== 'string') {
            throw new appError_1.AppError('Employee ID is required', 400);
        }
        if (!data.qrData || typeof data.qrData !== 'string') {
            throw new appError_1.AppError('QR data is required', 400);
        }
    }
    static validateEvaluation(data) {
        if (!data.trainingRating || typeof data.trainingRating !== 'number') {
            throw new appError_1.AppError('Training rating is required and must be a number', 400);
        }
        if (data.trainingRating < 1 || data.trainingRating > 5) {
            throw new appError_1.AppError('Training rating must be between 1 and 5', 400);
        }
        if (data.trainerRating !== undefined && data.trainerRating !== null) {
            if (typeof data.trainerRating !== 'number') {
                throw new appError_1.AppError('Trainer rating must be a number', 400);
            }
            if (data.trainerRating < 1 || data.trainerRating > 5) {
                throw new appError_1.AppError('Trainer rating must be between 1 and 5', 400);
            }
        }
    }
}
exports.TrainingValidator = TrainingValidator;
