import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    setup2FA, verifyAndEnable2FA, disableUser2FA, getUser2FAStatus,
    updateUserBiometric,
    updateUserSessionTimeout,
    getUserSessions, revokeUserSession, revokeAllUserSessions,
    getUserActivityLogs,
    getUserSecurityStatus,
} from "../controllers/securityController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// 2FA
router.post("/2fa/setup", setup2FA);
router.post("/2fa/verify", verifyAndEnable2FA);
router.delete("/2fa", disableUser2FA);
router.get("/2fa/status", getUser2FAStatus);

// Biometric
router.put("/biometric", updateUserBiometric);

// Session timeout
router.put("/session-timeout", updateUserSessionTimeout);

// Sessions
router.get("/sessions", getUserSessions);
router.delete("/sessions/:id", revokeUserSession);
router.delete("/sessions", revokeAllUserSessions);

// Activity logs
router.get("/activity", getUserActivityLogs);

// Security status
router.get("/status", getUserSecurityStatus);

export default router;
