"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = require("../utils/appError");
const token_1 = require("../utils/token");
const imageUploadService_1 = require("./imageUploadService");
const authSecurity_1 = require("../utils/authSecurity");
const email_service_1 = require("./email.service");
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_RESENDS = 5;
const TRUSTED_DEVICE_DAYS = 7;
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
        return { token: (0, token_1.generateToken)({ userId: user.id, email: user.email }) };
    }
    async loginWithDeviceCheck(data, context) {
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
        const now = new Date();
        const deviceIdHash = (0, authSecurity_1.hashValue)(context.deviceId);
        const userAgentHash = (0, authSecurity_1.hashValue)(context.userAgent);
        const ipHash = context.ipAddress ? (0, authSecurity_1.hashValue)(context.ipAddress) : null;
        const trustedDevice = await prisma_1.default.trustedDevice.findUnique({
            where: {
                userId_deviceIdHash: {
                    userId: user.id,
                    deviceIdHash,
                },
            },
        });
        if (trustedDevice && trustedDevice.expiresAt > now) {
            await prisma_1.default.trustedDevice.update({
                where: { id: trustedDevice.id },
                data: {
                    lastUsedAt: now,
                    expiresAt: this.getTrustedDeviceExpiry(now),
                    userAgentHash,
                    ipHash,
                },
            });
            return {
                requiresOtp: false,
                token: (0, token_1.generateToken)({ userId: user.id, email: user.email }),
            };
        }
        if (trustedDevice && trustedDevice.expiresAt <= now) {
            await prisma_1.default.trustedDevice.delete({
                where: { id: trustedDevice.id },
            });
        }
        await prisma_1.default.loginOtpChallenge.updateMany({
            where: {
                userId: user.id,
                deviceIdHash,
                consumedAt: null,
                invalidatedAt: null,
                expiresAt: { gt: now },
            },
            data: {
                invalidatedAt: now,
            },
        });
        const otpCode = (0, authSecurity_1.generateOtpCode)();
        const challenge = await prisma_1.default.loginOtpChallenge.create({
            data: {
                challengeId: crypto_1.default.randomUUID(),
                userId: user.id,
                deviceIdHash,
                otpHash: (0, authSecurity_1.hashValue)(otpCode),
                expiresAt: this.getOtpExpiry(now),
                maxAttempts: OTP_MAX_ATTEMPTS,
                userAgentHash,
                ipHash,
            },
        });
        await email_service_1.emailService.sendLoginOtpEmail({
            to: user.email,
            otpCode,
            expiresInMinutes: OTP_EXPIRY_MINUTES,
        });
        return {
            requiresOtp: true,
            challengeId: challenge.challengeId,
            maskedEmail: (0, authSecurity_1.maskEmail)(user.email),
            expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
        };
    }
    async verifyOtpService(data, context) {
        const challenge = await prisma_1.default.loginOtpChallenge.findUnique({
            where: { challengeId: data.challengeId },
            include: { user: true },
        });
        if (!challenge) {
            throw new appError_1.AppError("Invalid OTP challenge.", 400);
        }
        this.assertChallengeUsable(challenge);
        const deviceIdHash = (0, authSecurity_1.hashValue)(context.deviceId);
        if (challenge.deviceIdHash !== deviceIdHash) {
            throw new appError_1.AppError("OTP challenge does not match this device.", 401);
        }
        const now = new Date();
        if (challenge.attemptCount >= challenge.maxAttempts) {
            await prisma_1.default.loginOtpChallenge.update({
                where: { id: challenge.id },
                data: { invalidatedAt: now },
            });
            throw new appError_1.AppError("OTP attempts exceeded. Please login again.", 429);
        }
        const otpMatches = (0, authSecurity_1.hashValue)(data.otpCode) === challenge.otpHash;
        if (!otpMatches) {
            const nextAttempts = challenge.attemptCount + 1;
            await prisma_1.default.loginOtpChallenge.update({
                where: { id: challenge.id },
                data: {
                    attemptCount: nextAttempts,
                    invalidatedAt: nextAttempts >= challenge.maxAttempts ? now : null,
                },
            });
            throw new appError_1.AppError("Invalid OTP code.", 401);
        }
        const userAgentHash = (0, authSecurity_1.hashValue)(context.userAgent);
        const ipHash = context.ipAddress ? (0, authSecurity_1.hashValue)(context.ipAddress) : null;
        await prisma_1.default.loginOtpChallenge.update({
            where: { id: challenge.id },
            data: {
                consumedAt: now,
                attemptCount: challenge.attemptCount + 1,
            },
        });
        await prisma_1.default.trustedDevice.upsert({
            where: {
                userId_deviceIdHash: {
                    userId: challenge.userId,
                    deviceIdHash,
                },
            },
            update: {
                userAgentHash,
                ipHash,
                lastUsedAt: now,
                expiresAt: this.getTrustedDeviceExpiry(now),
            },
            create: {
                userId: challenge.userId,
                deviceIdHash,
                userAgentHash,
                ipHash,
                expiresAt: this.getTrustedDeviceExpiry(now),
                lastUsedAt: now,
            },
        });
        return {
            token: (0, token_1.generateToken)({
                userId: challenge.user.id,
                email: challenge.user.email,
            }),
        };
    }
    async resendOtpService(data, context) {
        const challenge = await prisma_1.default.loginOtpChallenge.findUnique({
            where: { challengeId: data.challengeId },
            include: { user: true },
        });
        if (!challenge) {
            throw new appError_1.AppError("Invalid OTP challenge.", 400);
        }
        this.assertChallengeUsable(challenge);
        const now = new Date();
        const secondsSinceLastSent = Math.floor((now.getTime() - challenge.lastSentAt.getTime()) / 1000);
        if (secondsSinceLastSent < OTP_RESEND_COOLDOWN_SECONDS) {
            throw new appError_1.AppError(`Please wait ${OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSent} seconds before requesting a new OTP.`, 429);
        }
        if (challenge.resendCount >= OTP_MAX_RESENDS) {
            throw new appError_1.AppError("Maximum OTP resends reached. Please login again.", 429);
        }
        const deviceIdHash = (0, authSecurity_1.hashValue)(context.deviceId);
        if (challenge.deviceIdHash !== deviceIdHash) {
            throw new appError_1.AppError("OTP challenge does not match this device.", 401);
        }
        await prisma_1.default.loginOtpChallenge.updateMany({
            where: {
                userId: challenge.userId,
                deviceIdHash,
                consumedAt: null,
                invalidatedAt: null,
            },
            data: {
                invalidatedAt: now,
            },
        });
        const otpCode = (0, authSecurity_1.generateOtpCode)();
        const userAgentHash = (0, authSecurity_1.hashValue)(context.userAgent);
        const ipHash = context.ipAddress ? (0, authSecurity_1.hashValue)(context.ipAddress) : null;
        const nextChallenge = await prisma_1.default.loginOtpChallenge.create({
            data: {
                challengeId: crypto_1.default.randomUUID(),
                userId: challenge.userId,
                deviceIdHash,
                otpHash: (0, authSecurity_1.hashValue)(otpCode),
                expiresAt: this.getOtpExpiry(now),
                maxAttempts: OTP_MAX_ATTEMPTS,
                resendCount: challenge.resendCount + 1,
                lastSentAt: now,
                userAgentHash,
                ipHash,
            },
        });
        await email_service_1.emailService.sendLoginOtpEmail({
            to: challenge.user.email,
            otpCode,
            expiresInMinutes: OTP_EXPIRY_MINUTES,
        });
        return {
            challengeId: nextChallenge.challengeId,
            maskedEmail: (0, authSecurity_1.maskEmail)(challenge.user.email),
            expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
        };
    }
    assertChallengeUsable(challenge) {
        const now = new Date();
        if (challenge.consumedAt) {
            throw new appError_1.AppError("OTP challenge already used.", 400);
        }
        if (challenge.invalidatedAt) {
            throw new appError_1.AppError("OTP challenge is no longer valid.", 400);
        }
        if (challenge.expiresAt <= now) {
            throw new appError_1.AppError("OTP code has expired. Please login again.", 401);
        }
    }
    getTrustedDeviceExpiry(fromDate) {
        return new Date(fromDate.getTime() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);
    }
    getOtpExpiry(fromDate) {
        return new Date(fromDate.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
    }
}
exports.AuthService = AuthService;
