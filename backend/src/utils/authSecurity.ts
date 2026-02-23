import crypto from "crypto";
import { Request } from "express";

const DEFAULT_DEVICE_COOKIE_NAME = "deviceId";
const OTP_LENGTH = 6;

export const getDeviceCookieName = (): string =>
  process.env.DEVICE_COOKIE_NAME || DEFAULT_DEVICE_COOKIE_NAME;

export const hashValue = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

export const generateDeviceId = (): string => crypto.randomUUID();

export const normalizeIp = (ip: string | undefined): string => {
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
};

export const extractIpAddress = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return normalizeIp(forwarded.split(",")[0]?.trim());
  }
  return normalizeIp(req.ip || "");
};

export const extractUserAgent = (req: Request): string =>
  req.get("user-agent") || "unknown";

export const generateOtpCode = (): string => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(crypto.randomInt(min, max + 1));
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }

  const visibleStart = localPart.slice(0, 2);
  const masked = "*".repeat(Math.max(localPart.length - 2, 2));
  return `${visibleStart}${masked}@${domain}`;
};
