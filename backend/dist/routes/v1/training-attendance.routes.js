"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendance_controller_1 = require("../../modules/training/controllers/attendance.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const attendanceController = new attendance_controller_1.TrainingAttendanceController();
// Attendance update endpoint (not nested under trainings)
router.patch('/:id', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), attendanceController.updateAttendance);
// Create or update attendance by enrollmentId (HR/Admin/Manager only)
router.post('/enrollment/:enrollmentId', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), attendanceController.createOrUpdateAttendanceByEnrollment);
exports.default = router;
