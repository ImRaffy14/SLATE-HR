"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
const token_1 = require("../utils/token");
const imageUploadService_1 = require("./imageUploadService");
class AuthService {
    async registerService(data, image) {
        const { name, email, password, role, employeeId } = data;
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new appError_1.AppError("User already exists", 400);
        }
        // If employeeId is provided, validate it exists and is not already linked
        if (employeeId) {
            const employee = await prisma_1.default.employee.findUnique({
                where: { id: employeeId },
                select: { id: true, status: true }
            });
            if (!employee) {
                throw new appError_1.AppError("Employee record not found", 400);
            }
            if (employee.status !== 'ACTIVE') {
                throw new appError_1.AppError("Employee record is not active", 400);
            }
            // Check if employee is already linked to another user
            const existingLink = await prisma_1.default.user.findFirst({
                where: { employeeId }
            });
            if (existingLink) {
                throw new appError_1.AppError("Employee already has a user account linked", 400);
            }
        }
        if (!image) {
            throw new appError_1.AppError("Image is required", 400);
        }
        const result = await (0, imageUploadService_1.uploadImage)(image.buffer, "users-avatar");
        if (!result) {
            throw new appError_1.AppError("Image upload failed", 500);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role,
                employeeId: employeeId || null, // Link employeeId if provided
                image: {
                    imageUrl: result.url,
                    publicId: result.public_id,
                },
            },
        });
        return user;
    }
    async loginService(data) {
        const { email, password } = data;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new appError_1.AppError("Invalid email or password", 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new appError_1.AppError("Invalid email or password", 401);
        }
        const token = (0, token_1.generateToken)({ userId: user.id, email: user.email });
        return { token };
    }
}
exports.AuthService = AuthService;
