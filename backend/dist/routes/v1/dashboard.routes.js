"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../../controllers/dashboard.controller");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
/**
 * @route   GET /api/v1/dashboard/admin
 * @desc    Get admin dashboard overview data
 * @access  Private (Admin, HR only)
 */
router.get('/admin', (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), dashboard_controller_1.getAdminDashboard);
exports.default = router;
