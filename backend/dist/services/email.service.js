"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const appError_1 = require("../utils/appError");
class EmailService {
    constructor() {
        this.transporter = null;
    }
    getTransporter() {
        if (this.transporter)
            return this.transporter;
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (!host || !user || !pass) {
            throw new appError_1.AppError("SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.", 500);
        }
        this.transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
        return this.transporter;
    }
    async sendLoginOtpEmail(args) {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER;
        if (!from) {
            throw new appError_1.AppError("SMTP sender is not configured. Please set SMTP_FROM or SMTP_USER.", 500);
        }
        const transporter = this.getTransporter();
        const subject = "Your SLATE HR login verification code";
        const text = `Your verification code is ${args.otpCode}. It will expire in ${args.expiresInMinutes} minutes. If you did not attempt to log in, please ignore this email.`;
        const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>Login verification code</h2>
        <p>Use this code to complete your login:</p>
        <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">${args.otpCode}</p>
        <p>This code expires in ${args.expiresInMinutes} minutes.</p>
        <p>If you did not attempt to log in, you can safely ignore this message.</p>
      </div>
    `;
        await transporter.sendMail({
            from,
            to: args.to,
            subject,
            text,
            html,
        });
    }
}
exports.emailService = new EmailService();
