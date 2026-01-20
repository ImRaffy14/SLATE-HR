"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingAttendanceController = void 0;
const attendance_service_1 = require("../services/attendance.service");
const asyncHandler_1 = require("../../../utils/asyncHandler");
class TrainingAttendanceController {
    constructor() {
        this.attendanceService = new attendance_service_1.TrainingAttendanceService();
        // Generate QR code
        this.generateQRCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.attendanceService.generateQRCode(req.params.id);
            res.status(200).json({ status: 'success', ...result });
        });
        // Scan QR code and mark attendance
        this.scanQRCode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { employeeId, qrData, location } = req.body;
            const attendance = await this.attendanceService.scanQRCode(req.params.id, employeeId, qrData, location);
            res.status(200).json({ status: 'success', attendance });
        });
        // Get attendance list
        this.getAttendanceList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const attendanceList = await this.attendanceService.getAttendanceList(req.params.id);
            res.status(200).json({ status: 'success', attendanceList });
        });
        // Update attendance manually
        this.updateAttendance = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const attendance = await this.attendanceService.updateAttendance(req.params.id, req.body);
            res.status(200).json({ status: 'success', attendance });
        });
        // Create or update attendance by enrollmentId (HR/Admin/Manager only)
        this.createOrUpdateAttendanceByEnrollment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { enrollmentId } = req.params;
            const { status, timeIn, location } = req.body;
            const attendance = await this.attendanceService.createOrUpdateAttendanceByEnrollment(enrollmentId, {
                status,
                timeIn: timeIn ? new Date(timeIn) : undefined,
                location
            });
            res.status(200).json({ status: 'success', attendance });
        });
    }
}
exports.TrainingAttendanceController = TrainingAttendanceController;
