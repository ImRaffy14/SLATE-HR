"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskEmail = exports.generateOtpCode = exports.extractUserAgent = exports.extractIpAddress = exports.normalizeIp = exports.generateDeviceId = exports.hashValue = exports.getDeviceCookieName = void 0;
const crypto_1 = __importDefault(require("crypto"));
const DEFAULT_DEVICE_COOKIE_NAME = "deviceId";
const OTP_LENGTH = 6;
const getDeviceCookieName = () => process.env.DEVICE_COOKIE_NAME || DEFAULT_DEVICE_COOKIE_NAME;
exports.getDeviceCookieName = getDeviceCookieName;
const hashValue = (value) => crypto_1.default.createHash("sha256").update(value).digest("hex");
exports.hashValue = hashValue;
const generateDeviceId = () => crypto_1.default.randomUUID();
exports.generateDeviceId = generateDeviceId;
const normalizeIp = (ip) => {
    if (!ip)
        return "";
    if (ip.startsWith("::ffff:"))
        return ip.replace("::ffff:", "");
    return ip;
};
exports.normalizeIp = normalizeIp;
const extractIpAddress = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
        return (0, exports.normalizeIp)(forwarded.split(",")[0]?.trim());
    }
    return (0, exports.normalizeIp)(req.ip || "");
};
exports.extractIpAddress = extractIpAddress;
const extractUserAgent = (req) => req.get("user-agent") || "unknown";
exports.extractUserAgent = extractUserAgent;
const generateOtpCode = () => {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    return String(crypto_1.default.randomInt(min, max + 1));
};
exports.generateOtpCode = generateOtpCode;
const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain)
        return email;
    if (localPart.length <= 2) {
        return `${localPart[0] || "*"}*@${domain}`;
    }
    const visibleStart = localPart.slice(0, 2);
    const masked = "*".repeat(Math.max(localPart.length - 2, 2));
    return `${visibleStart}${masked}@${domain}`;
};
exports.maskEmail = maskEmail;
