"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const fileUpload_service_1 = require("../../../services/fileUpload.service");
class AchievementService {
    /**
     * Upload achievement/certificate for an employee
     */
    async uploadAchievement(employeeId, file, data) {
        // Validate employee exists
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee) {
            throw new appError_1.AppError('Employee not found', 404);
        }
        // Validate file
        (0, fileUpload_service_1.validateFileType)(file);
        (0, fileUpload_service_1.validateFileSize)(file, 10 * 1024 * 1024); // 10MB max
        // Validate competency if provided
        if (data.competencyId) {
            const competency = await prisma_1.default.competency.findUnique({
                where: { id: data.competencyId }
            });
            if (!competency) {
                throw new appError_1.AppError('Competency not found', 404);
            }
        }
        // Upload file to Cloudinary
        const uploadResult = await (0, fileUpload_service_1.uploadFile)(file.buffer, 'ess-achievements', file.mimetype);
        // Create achievement upload record
        const achievement = await prisma_1.default.achievementUpload.create({
            data: {
                employeeId,
                title: data.title,
                description: data.description,
                fileUrl: uploadResult.url,
                competencyId: data.competencyId || null,
                status: 'Pending' // Requires HR/Manager approval
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                competency: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return achievement;
    }
    /**
     * Get employee's achievement uploads
     */
    async getEmployeeAchievements(employeeId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        const where = {
            employeeId
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.competencyId) {
            where.competencyId = filters.competencyId;
        }
        const [achievements, total] = await Promise.all([
            prisma_1.default.achievementUpload.findMany({
                where,
                skip,
                take: limit,
                include: {
                    competency: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma_1.default.achievementUpload.count({ where })
        ]);
        return {
            achievements,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
exports.AchievementService = AchievementService;
