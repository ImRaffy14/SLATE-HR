import { AppError } from './appError';

export interface ProficiencyLevel {
  levelNumber: number;
  title: string;
  definition: string;
}

export const validateWeight = (weight: number): void => {
  if (weight < 1 || weight > 100) {
    throw new AppError('Weight must be between 1 and 100', 400);
  }
};

export const validateProficiencyLevels = (levels: ProficiencyLevel[]): void => {
  if (!levels || levels.length === 0) {
    throw new AppError('At least one proficiency level is required', 400);
  }

  // Check for unique level numbers
  const levelNumbers = levels.map(level => level.levelNumber);
  const uniqueLevelNumbers = new Set(levelNumbers);
  
  if (levelNumbers.length !== uniqueLevelNumbers.size) {
    throw new AppError('Proficiency levels must have unique level numbers', 400);
  }

  // Check that all levels are between 1-5
  for (const level of levels) {
    if (level.levelNumber < 1 || level.levelNumber > 5) {
      throw new AppError('Proficiency level numbers must be between 1 and 5', 400);
    }
    
    if (!level.title || level.title.trim() === '') {
      throw new AppError('Each proficiency level must have a title', 400);
    }
    
    if (!level.definition || level.definition.trim() === '') {
      throw new AppError('Each proficiency level must have a definition', 400);
    }
  }

  // Check if sorted (optional validation, but recommended)
  const sortedLevels = [...levelNumbers].sort((a, b) => a - b);
  if (JSON.stringify(levelNumbers) !== JSON.stringify(sortedLevels)) {
    throw new AppError('Proficiency levels should be sorted by level number (1-5)', 400);
  }
};

export const validateRating = (rating: number | null | undefined, fieldName: string = 'Rating'): void => {
  if (rating === null || rating === undefined) {
    return; // Allow null/undefined for optional ratings
  }
  
  if (rating < 1 || rating > 5) {
    throw new AppError(`${fieldName} must be between 1 and 5`, 400);
  }
  
  if (!Number.isInteger(rating)) {
    throw new AppError(`${fieldName} must be an integer`, 400);
  }
};

export const validateFileType = (mimetype: string): void => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (!allowedMimeTypes.includes(mimetype)) {
    throw new AppError('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 400);
  }
};

export const validateFileSize = (size: number, maxSize: number = 10 * 1024 * 1024): void => {
  if (size > maxSize) {
    throw new AppError(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`, 400);
  }
};

