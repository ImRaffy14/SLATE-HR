"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetencyCategoryService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
class CompetencyCategoryService {
    // Create category with duplicate validation
    async createCategory(data) {
        // Check for duplicate name (case-insensitive)
        const existingCategory = await prisma_1.default.competencyCategory.findFirst({
            where: {
                name: {
                    equals: data.name,
                    mode: 'insensitive'
                }
            }
        });
        if (existingCategory) {
            throw new appError_1.AppError('Category with this name already exists', 400);
        }
        // Validate job roles exist if provided
        if (data.jobRoleIds && data.jobRoleIds.length > 0) {
            const jobRoles = await prisma_1.default.jobRole.findMany({
                where: {
                    id: { in: data.jobRoleIds }
                }
            });
            if (jobRoles.length !== data.jobRoleIds.length) {
                throw new appError_1.AppError('One or more job role IDs are invalid', 400);
            }
        }
        return prisma_1.default.competencyCategory.create({
            data: {
                name: data.name,
                description: data.description,
                jobRoleIds: data.jobRoleIds || [],
            },
            include: {
                competencies: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
    }
    // Get all categories
    async getCategories() {
        return prisma_1.default.competencyCategory.findMany({
            include: {
                competencies: {
                    select: {
                        id: true,
                        name: true,
                        weight: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    // Get single category by ID
    async getCategoryById(id) {
        const category = await prisma_1.default.competencyCategory.findUnique({
            where: { id },
            include: {
                competencies: true
            }
        });
        if (!category) {
            throw new appError_1.AppError('Category not found', 404);
        }
        return category;
    }
    // Update category
    async updateCategory(id, data) {
        const category = await prisma_1.default.competencyCategory.findUnique({
            where: { id }
        });
        if (!category) {
            throw new appError_1.AppError('Category not found', 404);
        }
        // Check for duplicate name if name is being updated
        if (data.name && data.name !== category.name) {
            const existingCategory = await prisma_1.default.competencyCategory.findFirst({
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
            if (existingCategory) {
                throw new appError_1.AppError('Category with this name already exists', 400);
            }
        }
        // Validate job roles exist if provided
        if (data.jobRoleIds && data.jobRoleIds.length > 0) {
            const jobRoles = await prisma_1.default.jobRole.findMany({
                where: {
                    id: { in: data.jobRoleIds }
                }
            });
            if (jobRoles.length !== data.jobRoleIds.length) {
                throw new appError_1.AppError('One or more job role IDs are invalid', 400);
            }
        }
        return prisma_1.default.competencyCategory.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.jobRoleIds !== undefined && { jobRoleIds: data.jobRoleIds }),
            },
            include: {
                competencies: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
    }
    // Delete category with cascade check
    async deleteCategory(id) {
        const category = await prisma_1.default.competencyCategory.findUnique({
            where: { id },
            include: {
                competencies: true
            }
        });
        if (!category) {
            throw new appError_1.AppError('Category not found', 404);
        }
        // Check if category has competencies
        if (category.competencies.length > 0) {
            throw new appError_1.AppError(`Cannot delete category. It has ${category.competencies.length} associated competency(ies). Please remove or reassign them first.`, 400);
        }
        return prisma_1.default.competencyCategory.delete({
            where: { id }
        });
    }
    // Get categories by job role ID (employee positionId)
    async getCategoriesByJobRoleId(jobRoleId) {
        return prisma_1.default.competencyCategory.findMany({
            where: {
                jobRoleIds: {
                    has: jobRoleId // MongoDB array contains operator
                }
            },
            include: {
                competencies: {
                    select: {
                        id: true,
                        name: true,
                        weight: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    // Get categories by employee's positionId
    async getCategoriesByEmployeePosition(employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            select: { positionId: true }
        });
        if (!employee || !employee.positionId) {
            // If employee has no positionId, return empty array or all categories
            // For now, return all categories
            return this.getCategories();
        }
        return this.getCategoriesByJobRoleId(employee.positionId);
    }
    // Get all categories with optional job role ID filter
    async getCategoriesWithFilter(jobRoleId) {
        if (jobRoleId) {
            return this.getCategoriesByJobRoleId(jobRoleId);
        }
        return this.getCategories();
    }
}
exports.CompetencyCategoryService = CompetencyCategoryService;
