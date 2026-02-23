"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../controllers/auth.controller");
const verifyToken_1 = require("../../middlewares/verifyToken");
const multer_1 = __importDefault(require("../../middlewares/multer"));
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', multer_1.default.single('image'), authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.get('/profile', verifyToken_1.verifyToken, authController.getUserProfile);
router.post('/logout', authController.logoutUser);
exports.default = router;
