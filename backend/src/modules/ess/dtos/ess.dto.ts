/**
 * DTOs for ESS (Employee Self-Service) module
 */

export interface AchievementUploadDTO {
  title: string;
  description?: string;
  competencyId?: string;
}

export interface NotificationFiltersDTO {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

