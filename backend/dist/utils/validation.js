"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileSize = exports.validateFileType = exports.validateRating = exports.validateProficiencyLevels = exports.validateWeight = void 0;
const appError_1 = require("./appError");
const validateWeight = (weight) => {
    if (weight < 1 || weight > 100) {
        throw new appError_1.AppError('Weight must be between 1 and 100', 400);
    }
};
exports.validateWeight = validateWeight;
const validateProficiencyLevels = (levels) => {
    if (!levels || levels.length === 0) {
        throw new appError_1.AppError('At least one proficiency level is required', 400);
    }
    // Check for unique level numbers
    const levelNumbers = levels.map(level => level.levelNumber);
    const uniqueLevelNumbers = new Set(levelNumbers);
    if (levelNumbers.length !== uniqueLevelNumbers.size) {
        throw new appError_1.AppError('Proficiency levels must have unique level numbers', 400);
    }
    // Check that all levels are between 1-5
    for (const level of levels) {
        if (level.levelNumber < 1 || level.levelNumber > 5) {
            throw new appError_1.AppError('Proficiency level numbers must be between 1 and 5', 400);
        }
        if (!level.title || level.title.trim() === '') {
            throw new appError_1.AppError('Each proficiency level must have a title', 400);
        }
        if (!level.definition || level.definition.trim() === '') {
            throw new appError_1.AppError('Each proficiency level must have a definition', 400);
        }
    }
    // Check if sorted (optional validation, but recommended)
    const sortedLevels = [...levelNumbers].sort((a, b) => a - b);
    if (JSON.stringify(levelNumbers) !== JSON.stringify(sortedLevels)) {
        throw new appError_1.AppError('Proficiency levels should be sorted by level number (1-5)', 400);
    }
};
exports.validateProficiencyLevels = validateProficiencyLevels;
const validateRating = (rating, fieldName = 'Rating') => {
    if (rating === null || rating === undefined) {
        return; // Allow null/undefined for optional ratings
    }
    if (rating < 1 || rating > 5) {
        throw new appError_1.AppError(`${fieldName} must be between 1 and 5`, 400);
    }
    if (!Number.isInteger(rating)) {
        throw new appError_1.AppError(`${fieldName} must be an integer`, 400);
    }
};
exports.validateRating = validateRating;
const validateFileType = (mimetype) => {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    if (!allowedMimeTypes.includes(mimetype)) {
        throw new appError_1.AppError('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 400);
    }
};
exports.validateFileType = validateFileType;
const validateFileSize = (size, maxSize = 10 * 1024 * 1024) => {
    if (size > maxSize) {
        throw new appError_1.AppError(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`, 400);
    }
};
exports.validateFileSize = validateFileSize;
