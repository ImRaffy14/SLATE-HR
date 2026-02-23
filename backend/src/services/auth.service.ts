import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma";
import { RegisterUser, LoginUser } from "../types";
import { UserRole } from "@prisma/client";
import { AppError } from "../utils/appError";
import { generateToken } from "../utils/token";
import { uploadImage } from "./imageUploadService";
import {
  generateOtpCode,
  hashValue,
  maskEmail,
} from "../utils/authSecurity";
import { emailService } from "./email.service";

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_RESENDS = 5;
const TRUSTED_DEVICE_DAYS = 7;

type LoginContext = {
  deviceId: string;
  userAgent: string;
  ipAddress: string;
};

type VerifyOtpInput = {
  challengeId: string;
  otpCode: string;
};

type ResendOtpInput = {
  challengeId: string;
};

export class AuthService {
  async registerService(data: RegisterUser, image: any) {
    const { name, email, password, role, employeeId } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // If employeeId is provided, validate it exists and is not already linked
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, status: true }
      });

      if (!employee) {
        throw new AppError("Employee record not found", 400);
      }

      if (employee.status !== 'ACTIVE') {
        throw new AppError("Employee record is not active", 400);
      }

      // Check if employee is already linked to another user
      const existingLink = await prisma.user.findFirst({
        where: { employeeId }
      });

      if (existingLink) {
        throw new AppError("Employee already has a user account linked", 400);
      }
    }

    if (!image) {
      throw new AppError("Image is required", 400);
    }

    const result = await uploadImage(image.buffer, "users-avatar");
    if (!result) {
      throw new AppError("Image upload failed", 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        employeeId: employeeId || null, // Link employeeId if provided
        image: {
          imageUrl: result.url,
          publicId: result.public_id,
        },
      },
    });

    return user;
  }

  async loginService(data: LoginUser) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    return { token: generateToken({ userId: user.id, email: user.email }) };
  }

  async loginWithDeviceCheck(data: LoginUser, context: LoginContext) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const now = new Date();
    const deviceIdHash = hashValue(context.deviceId);
    const userAgentHash = hashValue(context.userAgent);
    const ipHash = context.ipAddress ? hashValue(context.ipAddress) : null;

    const trustedDevice = await prisma.trustedDevice.findUnique({
      where: {
        userId_deviceIdHash: {
          userId: user.id,
          deviceIdHash,
        },
      },
    });

    if (trustedDevice && trustedDevice.expiresAt > now) {
      await prisma.trustedDevice.update({
        where: { id: trustedDevice.id },
        data: {
          lastUsedAt: now,
          expiresAt: this.getTrustedDeviceExpiry(now),
          userAgentHash,
          ipHash,
        },
      });

      return {
        requiresOtp: false as const,
        token: generateToken({ userId: user.id, email: user.email }),
      };
    }

    if (trustedDevice && trustedDevice.expiresAt <= now) {
      await prisma.trustedDevice.delete({
        where: { id: trustedDevice.id },
      });
    }

    await prisma.loginOtpChallenge.updateMany({
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

    const otpCode = generateOtpCode();
    const challenge = await prisma.loginOtpChallenge.create({
      data: {
        challengeId: crypto.randomUUID(),
        userId: user.id,
        deviceIdHash,
        otpHash: hashValue(otpCode),
        expiresAt: this.getOtpExpiry(now),
        maxAttempts: OTP_MAX_ATTEMPTS,
        userAgentHash,
        ipHash,
      },
    });

    await emailService.sendLoginOtpEmail({
      to: user.email,
      otpCode,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });

    return {
      requiresOtp: true as const,
      challengeId: challenge.challengeId,
      maskedEmail: maskEmail(user.email),
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
  }

  async verifyOtpService(data: VerifyOtpInput, context: LoginContext) {
    const challenge = await prisma.loginOtpChallenge.findUnique({
      where: { challengeId: data.challengeId },
      include: { user: true },
    });

    if (!challenge) {
      throw new AppError("Invalid OTP challenge.", 400);
    }

    this.assertChallengeUsable(challenge);

    const deviceIdHash = hashValue(context.deviceId);
    if (challenge.deviceIdHash !== deviceIdHash) {
      throw new AppError("OTP challenge does not match this device.", 401);
    }

    const now = new Date();
    if (challenge.attemptCount >= challenge.maxAttempts) {
      await prisma.loginOtpChallenge.update({
        where: { id: challenge.id },
        data: { invalidatedAt: now },
      });
      throw new AppError("OTP attempts exceeded. Please login again.", 429);
    }

    const otpMatches = hashValue(data.otpCode) === challenge.otpHash;
    if (!otpMatches) {
      const nextAttempts = challenge.attemptCount + 1;
      await prisma.loginOtpChallenge.update({
        where: { id: challenge.id },
        data: {
          attemptCount: nextAttempts,
          invalidatedAt: nextAttempts >= challenge.maxAttempts ? now : null,
        },
      });
      throw new AppError("Invalid OTP code.", 401);
    }

    const userAgentHash = hashValue(context.userAgent);
    const ipHash = context.ipAddress ? hashValue(context.ipAddress) : null;

    await prisma.loginOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        consumedAt: now,
        attemptCount: challenge.attemptCount + 1,
      },
    });

    await prisma.trustedDevice.upsert({
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
      token: generateToken({
        userId: challenge.user.id,
        email: challenge.user.email,
      }),
    };
  }

  async resendOtpService(data: ResendOtpInput, context: LoginContext) {
    const challenge = await prisma.loginOtpChallenge.findUnique({
      where: { challengeId: data.challengeId },
      include: { user: true },
    });

    if (!challenge) {
      throw new AppError("Invalid OTP challenge.", 400);
    }

    this.assertChallengeUsable(challenge);

    const now = new Date();
    const secondsSinceLastSent = Math.floor(
      (now.getTime() - challenge.lastSentAt.getTime()) / 1000
    );
    if (secondsSinceLastSent < OTP_RESEND_COOLDOWN_SECONDS) {
      throw new AppError(
        `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSent} seconds before requesting a new OTP.`,
        429
      );
    }

    if (challenge.resendCount >= OTP_MAX_RESENDS) {
      throw new AppError("Maximum OTP resends reached. Please login again.", 429);
    }

    const deviceIdHash = hashValue(context.deviceId);
    if (challenge.deviceIdHash !== deviceIdHash) {
      throw new AppError("OTP challenge does not match this device.", 401);
    }

    await prisma.loginOtpChallenge.updateMany({
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

    const otpCode = generateOtpCode();
    const userAgentHash = hashValue(context.userAgent);
    const ipHash = context.ipAddress ? hashValue(context.ipAddress) : null;
    const nextChallenge = await prisma.loginOtpChallenge.create({
      data: {
        challengeId: crypto.randomUUID(),
        userId: challenge.userId,
        deviceIdHash,
        otpHash: hashValue(otpCode),
        expiresAt: this.getOtpExpiry(now),
        maxAttempts: OTP_MAX_ATTEMPTS,
        resendCount: challenge.resendCount + 1,
        lastSentAt: now,
        userAgentHash,
        ipHash,
      },
    });

    await emailService.sendLoginOtpEmail({
      to: challenge.user.email,
      otpCode,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });

    return {
      challengeId: nextChallenge.challengeId,
      maskedEmail: maskEmail(challenge.user.email),
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
  }

  private assertChallengeUsable(challenge: {
    consumedAt: Date | null;
    invalidatedAt: Date | null;
    expiresAt: Date;
  }): void {
    const now = new Date();
    if (challenge.consumedAt) {
      throw new AppError("OTP challenge already used.", 400);
    }
    if (challenge.invalidatedAt) {
      throw new AppError("OTP challenge is no longer valid.", 400);
    }
    if (challenge.expiresAt <= now) {
      throw new AppError("OTP code has expired. Please login again.", 401);
    }
  }

  private getTrustedDeviceExpiry(fromDate: Date): Date {
    return new Date(fromDate.getTime() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);
  }

  private getOtpExpiry(fromDate: Date): Date {
    return new Date(fromDate.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  }
}
