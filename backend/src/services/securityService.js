import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const UAParser = require("ua-parser-js");
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";
import ActivityLog from "../models/ActivityLog.js";

// ── 2FA ──────────────────────────────────────────────

export const generate2FASecret = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const secret = speakeasy.generateSecret({
        name: `ExpensePro (${user.email})`,
        issuer: "ExpensePro",
    });

    // Store secret temporarily (not yet verified)
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,
        qrCode: qrDataUrl,
        otpauthUrl: secret.otpauth_url,
    };
};

export const verify2FA = async (userId, token) => {
    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) throw new Error("2FA setup not initiated");

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 2,
    });

    if (!verified) throw new Error("Invalid verification code");

    user.twoFactorEnabled = true;
    await user.save();

    return { message: "Two-factor authentication enabled successfully" };
};

export const disable2FA = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.twoFactorEnabled = false;
    user.twoFactorSecret = "";
    await user.save();

    return { message: "Two-factor authentication disabled" };
};

export const get2FAStatus = async (userId) => {
    const user = await User.findById(userId).select("twoFactorEnabled");
    if (!user) throw new Error("User not found");
    return { enabled: user.twoFactorEnabled };
};

// ── Biometric ────────────────────────────────────────

export const updateBiometric = async (userId, { enabled, type }) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.biometricEnabled = !!enabled;
    user.biometricType = enabled ? (type || "fingerprint") : "";
    await user.save();

    return {
        biometricEnabled: user.biometricEnabled,
        biometricType: user.biometricType,
    };
};

// ── Session Timeout ──────────────────────────────────

export const updateSessionTimeout = async (userId, timeout) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.sessionTimeout = timeout;
    await user.save();

    return { sessionTimeout: user.sessionTimeout };
};

// ── Sessions ─────────────────────────────────────────

const parseDevice = (userAgentStr) => {
    const parser = new UAParser(userAgentStr);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    return {
        browser: `${browser.name || "Unknown"} ${browser.version || ""}`.trim(),
        os: `${os.name || "Unknown"} ${os.version || ""}`.trim(),
        device: device.model
            ? `${device.vendor || ""} ${device.model}`.trim()
            : `${browser.name || "Browser"} on ${os.name || "Desktop"}`,
    };
};

export const createSession = async (userId, req) => {
    const userAgent = req.headers["user-agent"] || "";
    const parsed = parseDevice(userAgent);
    const ip = req.ip || req.connection?.remoteAddress || "127.0.0.1";

    const session = await Session.create({
        userId,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        ip: ip.replace("::ffff:", ""),
        location: "Local",
        lastActive: new Date(),
        isActive: true,
    });

    return session;
};

export const getSessions = async (userId) => {
    const sessions = await Session.find({ userId, isActive: true })
        .sort({ lastActive: -1 })
        .lean();

    return sessions.map((s) => ({
        _id: s._id,
        device: s.device,
        browser: s.browser,
        os: s.os,
        ip: s.ip ? s.ip.replace(/\d+$/, "xxx") : "",
        location: s.location,
        lastActive: s.lastActive,
        isCurrent: false, // will be marked in controller
        createdAt: s.createdAt,
    }));
};

export const revokeSession = async (userId, sessionId) => {
    const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { isActive: false },
        { new: true }
    );
    if (!session) throw new Error("Session not found");
    return { message: "Session revoked" };
};

export const revokeAllSessions = async (userId, currentSessionId) => {
    await Session.updateMany(
        { userId, _id: { $ne: currentSessionId }, isActive: true },
        { isActive: false }
    );
    return { message: "All other sessions revoked" };
};

// ── Activity Logs ────────────────────────────────────

export const logActivity = async (userId, { action, detail, type, req }) => {
    const ip = req?.ip || req?.connection?.remoteAddress || "";
    const userAgent = req?.headers?.["user-agent"] || "";
    const parsed = parseDevice(userAgent);

    return ActivityLog.create({
        userId,
        action,
        detail,
        type: type || "auth",
        ip: ip.replace("::ffff:", ""),
        device: parsed.device,
    });
};

export const getActivityLogs = async (userId, filter, page = 1, limit = 20) => {
    const query = { userId };
    if (filter && filter !== "all") {
        query.type = filter;
    }

    const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const total = await ActivityLog.countDocuments(query);

    return { logs, total, page, pages: Math.ceil(total / limit) };
};

// ── Security Status ──────────────────────────────────

export const getSecurityStatus = async (userId) => {
    const user = await User.findById(userId).select(
        "twoFactorEnabled biometricEnabled biometricType sessionTimeout"
    );
    if (!user) throw new Error("User not found");

    return {
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled,
        biometricType: user.biometricType,
        sessionTimeout: user.sessionTimeout,
        encryption: {
            atRest: true,
            inTransit: true,
            passwordHashing: true,
            tokenSecurity: true,
        },
    };
};
