"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../config/prisma"));
const authSecurity_1 = require("../utils/authSecurity");
const appError_1 = require("../utils/appError");
const DEVICE_COOKIE_NAME = (0, authSecurity_1.getDeviceCookieName)();
const getCookieMaxAge = () => 7 * 24 * 60 * 60 * 1000;
const getCookieSettings = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: getCookieMaxAge(),
    signed: true,
});
const ensureDeviceId = (req, res) => {
    const signedCookies = (req.signedCookies || {});
    let deviceId = signedCookies[DEVICE_COOKIE_NAME];
    if (!deviceId) {
        deviceId = (0, authSecurity_1.generateDeviceId)();
        res.cookie(DEVICE_COOKIE_NAME, deviceId, getCookieSettings());
    }
    return deviceId;
};
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
        this.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userRegistered = await this.authService.registerService(req.body, req.file);
            res.status(201).json({
                status: 'success',
                message: `User ${userRegistered.name} registered successfully`,
                user: userRegistered,
            });
        });
        this.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const deviceId = ensureDeviceId(req, res);
            const loginResult = await this.authService.loginWithDeviceCheck(req.body, {
                deviceId,
                userAgent: (0, authSecurity_1.extractUserAgent)(req),
                ipAddress: (0, authSecurity_1.extractIpAddress)(req),
            });
            if (loginResult.requiresOtp) {
                res.status(200).json({
                    status: 'success',
                    message: 'OTP verification is required for this device.',
                    requiresOtp: true,
                    challengeId: loginResult.challengeId,
                    maskedEmail: loginResult.maskedEmail,
                    expiresInSeconds: loginResult.expiresInSeconds,
                });
                return;
            }
            res
                .cookie('accessToken', loginResult.token, {
                httpOnly: false,
                secure: false,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000,
            })
                .status(200)
                .json({
                status: 'success',
                message: 'Logged in successfully',
                token: loginResult.token,
            });
        });
        this.verifyOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { challengeId, otpCode } = req.body || {};
            if (!challengeId || !otpCode) {
                throw new appError_1.AppError('challengeId and otpCode are required.', 400);
            }
            const deviceId = ensureDeviceId(req, res);
            const result = await this.authService.verifyOtpService({ challengeId, otpCode }, {
                deviceId,
                userAgent: (0, authSecurity_1.extractUserAgent)(req),
                ipAddress: (0, authSecurity_1.extractIpAddress)(req),
            });
            res
                .cookie('accessToken', result.token, {
                httpOnly: false,
                secure: false,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000,
            })
                .status(200)
                .json({
                status: 'success',
                message: 'OTP verified successfully.',
                token: result.token,
            });
        });
        this.resendOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { challengeId } = req.body || {};
            if (!challengeId) {
                throw new appError_1.AppError('challengeId is required.', 400);
            }
            const deviceId = ensureDeviceId(req, res);
            const result = await this.authService.resendOtpService({ challengeId }, {
                deviceId,
                userAgent: (0, authSecurity_1.extractUserAgent)(req),
                ipAddress: (0, authSecurity_1.extractIpAddress)(req),
            });
            res.status(200).json({
                status: 'success',
                message: 'A new OTP was sent to your email.',
                challengeId: result.challengeId,
                maskedEmail: result.maskedEmail,
                expiresInSeconds: result.expiresInSeconds,
            });
        });
        this.getUserProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.userId || req.user?.id;
            const userData = await prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            res.status(200).json({
                status: 'success',
                user: userData,
            });
        });
        this.logoutUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            res
                .clearCookie('accessToken', {
                httpOnly: false,
                secure: false,
                sameSite: 'none', // now allowed since same domain
            })
                .status(200)
                .json({
                status: 'success',
                message: 'Logged out successfully',
            });
        });
    }
}
exports.AuthController = AuthController;
