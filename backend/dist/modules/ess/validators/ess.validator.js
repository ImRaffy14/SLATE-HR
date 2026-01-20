"use strict";
/**
 * Validators for ESS (Employee Self-Service) module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAchievementUpload = void 0;
const appError_1 = require("../../../utils/appError");
/**
 * Validate achievement upload data
 */
const validateAchievementUpload = (data) => {
    if (!data.title || !data.title.trim()) {
        throw new appError_1.AppError('Title is required', 400);
    }
    if (data.title.length > 200) {
        throw new appError_1.AppError('Title must be less than 200 characters', 400);
    }
    if (data.description && data.description.length > 1000) {
        throw new appError_1.AppError('Description must be less than 1000 characters', 400);
    }
};
exports.validateAchievementUpload = validateAchievementUpload;
