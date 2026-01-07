/**
 * Validators for ESS (Employee Self-Service) module
 */

import { AppError } from '../../../utils/appError';

/**
 * Validate achievement upload data
 */
export const validateAchievementUpload = (data: {
  title?: string;
  description?: string;
  competencyId?: string;
}): void => {
  if (!data.title || !data.title.trim()) {
    throw new AppError('Title is required', 400);
  }

  if (data.title.length > 200) {
    throw new AppError('Title must be less than 200 characters', 400);
  }

  if (data.description && data.description.length > 1000) {
    throw new AppError('Description must be less than 1000 characters', 400);
  }
};

