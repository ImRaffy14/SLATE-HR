"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
class EmployeeService {
    async getEmployeesService() {
        return prisma_1.default.employee.findMany({
            include: {
                jobRole: true,
                competencies: true,
                enrollments: true,
                performance: true,
                talentPools: true,
                idps: true,
                trainingEnrollments: true,
            },
        });
    }
    async getEmployeeByIdService(id) {
        return prisma_1.default.employee.findUnique({
            where: { id },
            include: {
                jobRole: true,
                competencies: true,
                enrollments: true,
                performance: true,
                talentPools: true,
                idps: true,
                trainingEnrollments: true,
            },
        });
    }
    async createEmployeeService(data) {
        // Validate required fields
        if (!data.name) {
            throw new appError_1.AppError("Name is required", 400);
        }
        // Generate employeeId automatically
        const lastEmployee = await prisma_1.default.employee.findFirst({
            where: {
                employeeId: {
                    startsWith: 'EMP-'
                }
            },
            orderBy: {
                employeeId: 'desc'
            }
        });
        let employeeId;
        if (lastEmployee) {
            const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP-', '') || '0');
            employeeId = `EMP-${String(lastNumber + 1).padStart(6, '0')}`;
        }
        else {
            employeeId = 'EMP-000001';
        }
        // Check for duplicate employeeId (shouldn't happen with auto-generation, but check anyway)
        const existingEmployee = await prisma_1.default.employee.findUnique({
            where: { employeeId }
        });
        if (existingEmployee) {
            // If duplicate found, generate next number
            const lastNumber = parseInt(employeeId.replace('EMP-', ''));
            employeeId = `EMP-${String(lastNumber + 1).padStart(6, '0')}`;
        }
        // Clean up data - remove empty strings and invalid positionId
        const cleanData = {
            employeeId,
            name: data.name.trim(),
            status: data.status || "ACTIVE",
        };
        if (data.email?.trim()) {
            cleanData.email = data.email.trim();
        }
        if (data.department?.trim()) {
            cleanData.department = data.department.trim();
        }
        if (data.position?.trim()) {
            cleanData.position = data.position.trim();
        }
        if (data.dateHired) {
            cleanData.dateHired = new Date(data.dateHired);
        }
        // Only include positionId if it's a valid non-empty string
        if (data.positionId && data.positionId.trim() !== "") {
            // Validate that the job role exists
            const jobRole = await prisma_1.default.jobRole.findUnique({
                where: { id: data.positionId.trim() }
            });
            if (!jobRole) {
                throw new appError_1.AppError("Invalid job role ID", 400);
            }
            cleanData.positionId = data.positionId.trim();
        }
        return prisma_1.default.employee.create({
            data: cleanData,
            include: {
                jobRole: true,
            },
        });
    }
    async updateEmployeeService(id, data) {
        return prisma_1.default.employee.update({
            where: { id },
            data,
        });
    }
    async deleteEmployeeService(id) {
        return prisma_1.default.employee.delete({
            where: { id },
        });
    }
}
exports.EmployeeService = EmployeeService;
