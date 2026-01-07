"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRoleService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
class JobRoleService {
    // Create job role
    async createJobRole(data) {
        // Check for duplicate name (case-insensitive)
        const existingJobRole = await prisma_1.default.jobRole.findFirst({
            where: {
                name: {
                    equals: data.name,
                    mode: 'insensitive'
                }
            }
        });
        if (existingJobRole) {
            throw new appError_1.AppError('Job role with this name already exists', 400);
        }
        return prisma_1.default.jobRole.create({
            data: {
                name: data.name,
                description: data.description,
            }
        });
    }
    // Get all job roles
    async getJobRoles() {
        return prisma_1.default.jobRole.findMany({
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                        employeeId: true,
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    // Get single job role by ID
    async getJobRoleById(id) {
        const jobRole = await prisma_1.default.jobRole.findUnique({
            where: { id },
            include: {
                employees: true
            }
        });
        if (!jobRole) {
            throw new appError_1.AppError('Job role not found', 404);
        }
        return jobRole;
    }
    // Update job role
    async updateJobRole(id, data) {
        const jobRole = await prisma_1.default.jobRole.findUnique({
            where: { id }
        });
        if (!jobRole) {
            throw new appError_1.AppError('Job role not found', 404);
        }
        // Check for duplicate name if name is being updated
        if (data.name && data.name !== jobRole.name) {
            const existingJobRole = await prisma_1.default.jobRole.findFirst({
                where: {
                    name: {
                        equals: data.name,
                        mode: 'insensitive'
                    },
                    NOT: {
                        id: id
                    }
                }
            });
            if (existingJobRole) {
                throw new appError_1.AppError('Job role with this name already exists', 400);
            }
        }
        return prisma_1.default.jobRole.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
            },
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
    }
    // Delete job role
    async deleteJobRole(id) {
        const jobRole = await prisma_1.default.jobRole.findUnique({
            where: { id },
            include: {
                employees: true
            }
        });
        if (!jobRole) {
            throw new appError_1.AppError('Job role not found', 404);
        }
        // Check if job role has employees
        if (jobRole.employees.length > 0) {
            throw new appError_1.AppError(`Cannot delete job role. It has ${jobRole.employees.length} employee(s) assigned. Please reassign them first.`, 400);
        }
        return prisma_1.default.jobRole.delete({
            where: { id }
        });
    }
}
exports.JobRoleService = JobRoleService;
