"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../config/prisma"));
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
            const userLoggedIn = await this.authService.loginService(req.body);
            res
                .cookie('accessToken', userLoggedIn.token, {
                httpOnly: false,
                secure: false,
                sameSite: 'none', // now allowed since same domain
                maxAge: 24 * 60 * 60 * 1000,
            })
                .status(200)
                .json({
                status: 'success',
                message: 'Logged in successfully',
                token: userLoggedIn.token, // Include token in response body
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
