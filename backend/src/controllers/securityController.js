import asyncHandler from "express-async-handler";
import {
    generate2FASecret, verify2FA, disable2FA, get2FAStatus,
    updateBiometric, updateSessionTimeout,
    getSessions, revokeSession, revokeAllSessions,
    getActivityLogs, logActivity,
    getSecurityStatus,
} from "../services/securityService.js";

// ── 2FA ──────────────────────────────────────────────

export const setup2FA = asyncHandler(async (req, res) => {
    const result = await generate2FASecret(req.user._id);
    await logActivity(req.user._id, {
        action: "2FA Setup Initiated",
        detail: "Started two-factor authentication setup",
        type: "security",
        req,
    });
    res.json(result);
});

export const verifyAndEnable2FA = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400);
        throw new Error("Verification code is required");
    }
    const result = await verify2FA(req.user._id, token);
    await logActivity(req.user._id, {
        action: "2FA Enabled",
        detail: "Two-factor authentication was enabled",
        type: "security",
        req,
    });
    res.json(result);
});

export const disableUser2FA = asyncHandler(async (req, res) => {
    const result = await disable2FA(req.user._id);
    await logActivity(req.user._id, {
        action: "2FA Disabled",
        detail: "Two-factor authentication was disabled",
        type: "security",
        req,
    });
    res.json(result);
});

export const getUser2FAStatus = asyncHandler(async (req, res) => {
    const result = await get2FAStatus(req.user._id);
    res.json(result);
});

// ── Biometric ────────────────────────────────────────

export const updateUserBiometric = asyncHandler(async (req, res) => {
    const { enabled, type } = req.body;
    const result = await updateBiometric(req.user._id, { enabled, type });
    await logActivity(req.user._id, {
        action: enabled ? "Biometric Enabled" : "Biometric Disabled",
        detail: enabled ? `Biometric login enabled (${type || "fingerprint"})` : "Biometric login disabled",
        type: "security",
        req,
    });
    res.json(result);
});

// ── Session Timeout ──────────────────────────────────

export const updateUserSessionTimeout = asyncHandler(async (req, res) => {
    const { timeout } = req.body;
    if (timeout === undefined) {
        res.status(400);
        throw new Error("Timeout value is required");
    }
    const result = await updateSessionTimeout(req.user._id, timeout);
    await logActivity(req.user._id, {
        action: "Session Timeout Updated",
        detail: `Auto-logout timer set to ${timeout} minutes`,
        type: "security",
        req,
    });
    res.json(result);
});

// ── Sessions ─────────────────────────────────────────

export const getUserSessions = asyncHandler(async (req, res) => {
    const sessions = await getSessions(req.user._id);

    // Mark latest session as current (simplistic approach)
    if (sessions.length > 0) {
        sessions[0].isCurrent = true;
    }

    res.json(sessions);
});

export const revokeUserSession = asyncHandler(async (req, res) => {
    const result = await revokeSession(req.user._id, req.params.id);
    await logActivity(req.user._id, {
        action: "Session Revoked",
        detail: `Revoked session ${req.params.id}`,
        type: "security",
        req,
    });
    res.json(result);
});

export const revokeAllUserSessions = asyncHandler(async (req, res) => {
    const { currentSessionId } = req.body;
    const result = await revokeAllSessions(req.user._id, currentSessionId);
    await logActivity(req.user._id, {
        action: "All Sessions Revoked",
        detail: "Revoked all other active sessions",
        type: "security",
        req,
    });
    res.json(result);
});

// ── Activity Logs ────────────────────────────────────

export const getUserActivityLogs = asyncHandler(async (req, res) => {
    const { type, page } = req.query;
    const result = await getActivityLogs(req.user._id, type, parseInt(page) || 1);
    res.json(result);
});

// ── Security Status ──────────────────────────────────

export const getUserSecurityStatus = asyncHandler(async (req, res) => {
    const status = await getSecurityStatus(req.user._id);
    res.json(status);
});
