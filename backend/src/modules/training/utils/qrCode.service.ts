import QRCode from 'qrcode';
import crypto from 'crypto';
import { AppError } from '../../../utils/appError';

export class QRCodeService {
  /**
   * Generate QR code data URL for a training
   */
  async generateQRCode(trainingId: string, enrollmentId?: string): Promise<string> {
    const payload = {
      trainingId,
      enrollmentId: enrollmentId || null,
      timestamp: Date.now(),
      secret: crypto.randomBytes(16).toString('hex')
    };

    const dataString = JSON.stringify(payload);

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: 'M',
        margin: 1
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Validate QR code payload
   */
  validateQRCode(qrData: string, trainingId: string, maxAgeMinutes: number = 60): {
    valid: boolean;
    enrollmentId?: string;
    error?: string;
  } {
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
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  /**
   * Generate QR code string (for storage in database)
   */
  generateQRCodeString(trainingId: string, enrollmentId?: string): string {
    const payload = {
      trainingId,
      enrollmentId: enrollmentId || null,
      timestamp: Date.now(),
      secret: crypto.randomBytes(16).toString('hex')
    };

    return JSON.stringify(payload);
  }
}

