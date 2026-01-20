"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
const imageUploadService_1 = require("./imageUploadService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async getUserService() {
        const users = await prisma_1.default.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return users;
    }
    async editUserService(data, id, image) {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new appError_1.AppError("User not found", 404);
        }
        const updatedFields = {
            name: data.name,
            email: data.email,
            role: data.role,
        };
        let newImageData;
        if (data.imagePublicId && image?.buffer) {
            const deleted = (0, imageUploadService_1.deleteImage)(data.imagePublicId);
            if (!deleted) {
                throw new appError_1.AppError("Image delete failed", 500);
            }
            const uploadResult = await (0, imageUploadService_1.uploadImage)(image.buffer, "users-avatar");
            if (!uploadResult) {
                throw new appError_1.AppError("Image upload failed", 500);
            }
            newImageData = {
                imageUrl: uploadResult.url,
                publicId: uploadResult.public_id,
            };
        }
        const updateData = {
            ...updatedFields,
            ...(newImageData && { image: newImageData }),
        };
        const userUpdated = await prisma_1.default.user.update({
            where: { id },
            data: updateData,
        });
        return userUpdated;
    }
    async changePasswordService(data, id) {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new appError_1.AppError("User not found", 404);
        }
        const isPasswordCorrect = await bcryptjs_1.default.compare(data, user.password);
        if (isPasswordCorrect) {
            throw new appError_1.AppError("New password cannot be the same as the old password", 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data, 10);
        const userUpdated = await prisma_1.default.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return userUpdated;
    }
    async deleteUserService(id) {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw new appError_1.AppError("User not found", 404);
        }
        if (user.image) {
            const deleted = (0, imageUploadService_1.deleteImage)(user.image.publicId);
            if (!deleted) {
                throw new appError_1.AppError("Image delete failed", 500);
            }
        }
        const deletedUser = await prisma_1.default.user.delete({ where: { id } });
        return deletedUser;
    }
}
exports.UserService = UserService;
