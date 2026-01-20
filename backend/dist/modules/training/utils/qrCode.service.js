"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const appError_1 = require("../../../utils/appError");
class QRCodeService {
    /**
     * Generate QR code data URL for a training
     */
    async generateQRCode(trainingId, enrollmentId) {
        const payload = {
            trainingId,
            enrollmentId: enrollmentId || null,
            timestamp: Date.now(),
            secret: crypto_1.default.randomBytes(16).toString('hex')
        };
        const dataString = JSON.stringify(payload);
        try {
            const qrCodeDataUrl = await qrcode_1.default.toDataURL(dataString, {
                errorCorrectionLevel: 'M',
                margin: 1
            });
            return qrCodeDataUrl;
        }
        catch (error) {
            throw new appError_1.AppError('Failed to generate QR code', 500);
        }
    }
    /**
     * Validate QR code payload
     */
    validateQRCode(qrData, trainingId, maxAgeMinutes = 60) {
        try {
            const payload = JSON.parse(qrData);
            // Validate structure
            if (!payload.trainingId || !payload.timestamp || !payload.secret) {
                return { valid: false, error: 'Invalid QR code format' };
            }
            // Validate training ID matches
            if (payload.trainingId !== trainingId) {
                return { valid: false, error: 'QR code does not match training' };
            }
            // Validate expiration
            const age = Date.now() - payload.timestamp;
            const maxAge = maxAgeMinutes * 60 * 1000;
            if (age > maxAge) {
                return { valid: false, error: 'QR code has expired' };
            }
            return {
                valid: true,
                enrollmentId: payload.enrollmentId || undefined
            };
        }
        catch (error) {
            return { valid: false, error: 'Invalid QR code data' };
        }
    }
    /**
     * Generate QR code string (for storage in database)
     */
    generateQRCodeString(trainingId, enrollmentId) {
        const payload = {
            trainingId,
            enrollmentId: enrollmentId || null,
            timestamp: Date.now(),
            secret: crypto_1.default.randomBytes(16).toString('hex')
        };
        return JSON.stringify(payload);
    }
}
exports.QRCodeService = QRCodeService;
