import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import prisma from '../config/prisma';
import {
  extractIpAddress,
  extractUserAgent,
  generateDeviceId,
  getDeviceCookieName,
} from '../utils/authSecurity';
import { AppError } from '../utils/appError';

const DEVICE_COOKIE_NAME = getDeviceCookieName();

const getCookieMaxAge = () => 7 * 24 * 60 * 60 * 1000;

const getCookieSettings = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: getCookieMaxAge(),
  signed: true,
});

const ensureDeviceId = (req: Request, res: Response): string => {
  const signedCookies = (req.signedCookies || {}) as Record<string, string | undefined>;
  let deviceId = signedCookies[DEVICE_COOKIE_NAME];

  if (!deviceId) {
    deviceId = generateDeviceId();
    res.cookie(DEVICE_COOKIE_NAME, deviceId, getCookieSettings());
  }

  return deviceId;
};

export class AuthController {
  private authService = new AuthService();

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const userRegistered = await this.authService.registerService(req.body, req.file);
    res.status(201).json({
      status: 'success',
      message: `User ${userRegistered.name} registered successfully`,
      user: userRegistered,
    });
  });

  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const deviceId = ensureDeviceId(req, res);
    const loginResult = await this.authService.loginWithDeviceCheck(req.body, {
      deviceId,
      userAgent: extractUserAgent(req),
      ipAddress: extractIpAddress(req),
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

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId, otpCode } = req.body || {};
    if (!challengeId || !otpCode) {
      throw new AppError('challengeId and otpCode are required.', 400);
    }

    const deviceId = ensureDeviceId(req, res);
    const result = await this.authService.verifyOtpService(
      { challengeId, otpCode },
      {
        deviceId,
        userAgent: extractUserAgent(req),
        ipAddress: extractIpAddress(req),
      }
    );

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

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId } = req.body || {};
    if (!challengeId) {
      throw new AppError('challengeId is required.', 400);
    }

    const deviceId = ensureDeviceId(req, res);
    const result = await this.authService.resendOtpService(
      { challengeId },
      {
        deviceId,
        userAgent: extractUserAgent(req),
        ipAddress: extractIpAddress(req),
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'A new OTP was sent to your email.',
      challengeId: result.challengeId,
      maskedEmail: result.maskedEmail,
      expiresInSeconds: result.expiresInSeconds,
    });
  });

  getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.user?.id;
    const userData = await prisma.user.findUnique({
      where: { id: userId },
    });
    res.status(200).json({
      status: 'success',
      user: userData,
    });
  });

  logoutUser = asyncHandler(async (req: Request, res: Response) => {
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
