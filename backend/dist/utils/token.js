"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = require("./appError");
const JWT_SECRET = process.env.JWT_SECRET;
const generateToken = (payload) => {
    if (!JWT_SECRET) {
        throw new appError_1.AppError('JWT secret is not defined', 500);
    }
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};
exports.generateToken = generateToken;
