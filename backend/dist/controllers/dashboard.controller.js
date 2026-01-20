"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const asyncHandler_1 = require("../utils/asyncHandler");
/**
 * Get Admin Dashboard data
 * Aggregates data from all modules for the admin overview
 */
exports.getAdminDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const dashboard = await dashboard_service_1.dashboardService.getAdminDashboard();
    res.status(200).json({
        success: true,
        dashboard
    });
});
