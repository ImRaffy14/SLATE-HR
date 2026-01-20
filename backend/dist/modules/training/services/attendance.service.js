"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingAttendanceService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const appError_1 = require("../../../utils/appError");
const client_1 = require("@prisma/client");
const qrCode_service_1 = require("../utils/qrCode.service");
class TrainingAttendanceService {
    constructor() {
        this.qrCodeService = new qrCode_service_1.QRCodeService();
    }
    /**
     * Generate QR code for training
     */
    async generateQRCode(trainingId) {
        const training = await prisma_1.default.training.findUnique({
            where: { id: trainingId }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        // Only generate QR for ongoing trainings
        if (training.status !== client_1.TrainingStatus.ONGOING) {
            throw new appError_1.AppError('QR code can only be generated for ongoing trainings', 400);
        }
        // Generate QR code
        const qrCodeDataUrl = await this.qrCodeService.generateQRCode(trainingId);
        const qrCodeString = this.qrCodeService.generateQRCodeString(trainingId);
        // Set expiration (training end time + 1 hour buffer)
        const qrCodeExpiresAt = new Date(training.endDate);
        qrCodeExpiresAt.setHours(qrCodeExpiresAt.getHours() + 1);
        // Update training with QR code
        await prisma_1.default.training.update({
            where: { id: trainingId },
            data: {
                qrCode: qrCodeString,
                qrCodeExpiresAt
            }
        });
        return {
            qrCode: qrCodeDataUrl,
            qrCodeString: qrCodeString,
            expiresAt: qrCodeExpiresAt
        };
    }
    /**
     * Scan QR code and mark attendance
     */
    async scanQRCode(trainingId, employeeId, qrData, location) {
        const training = await prisma_1.default.training.findUnique({
            where: { id: trainingId },
            include: {
                enrollments: {
                    where: {
                        employeeId,
                        status: 'APPROVED'
                    }
                }
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        // Validate enrollment
        const enrollment = training.enrollments[0];
        if (!enrollment) {
            throw new appError_1.AppError('Employee is not enrolled or enrollment not approved', 400);
        }
        // Validate QR code
        const maxAgeMinutes = Math.ceil((new Date(training.endDate).getTime() - Date.now()) / (1000 * 60)) + 60; // Training duration + 1 hour buffer
        const validation = this.qrCodeService.validateQRCode(qrData, trainingId, maxAgeMinutes);
        if (!validation.valid) {
            throw new appError_1.AppError(validation.error || 'Invalid QR code', 400);
        }
        // Check if attendance already marked
        const existingAttendance = await prisma_1.default.trainingAttendance.findUnique({
            where: { enrollmentId: enrollment.id }
        });
        if (existingAttendance) {
            if (existingAttendance.isLocked) {
                throw new appError_1.AppError('Attendance is locked and cannot be modified', 400);
            }
            // Update existing attendance
            return this.updateAttendance(existingAttendance.id, {
                status: this.determineAttendanceStatus(training.startDate),
                timeIn: new Date(),
                location,
                qrScannedAt: new Date()
            });
        }
        // Create new attendance record
        const attendance = await prisma_1.default.trainingAttendance.create({
            data: {
                enrollmentId: enrollment.id,
                status: this.determineAttendanceStatus(training.startDate),
                timeIn: new Date(),
                location,
                qrScannedAt: new Date()
            },
            include: {
                enrollment: {
                    include: {
                        employee: true,
                        training: true
                    }
                }
            }
        });
        return attendance;
    }
    /**
     * Get attendance list for a training
     */
    async getAttendanceList(trainingId) {
        const training = await prisma_1.default.training.findUnique({
            where: { id: trainingId },
            include: {
                enrollments: {
                    where: {
                        status: 'APPROVED'
                    },
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                department: true,
                                position: true
                            }
                        },
                        attendance: true,
                        evaluation: {
                            select: {
                                employeePerformanceRating: true,
                                employeeImprovementComments: true
                            }
                        }
                    }
                }
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        return training.enrollments.map(enrollment => ({
            enrollmentId: enrollment.id,
            employee: enrollment.employee,
            attendance: enrollment.attendance || {
                status: client_1.AttendanceStatus.ABSENT,
                timeIn: null,
                timeOut: null,
                isLocked: false
            },
            evaluation: enrollment.evaluation ? {
                employeePerformanceRating: enrollment.evaluation.employeePerformanceRating,
                employeeImprovementComments: enrollment.evaluation.employeeImprovementComments
            } : undefined
        }));
    }
    /**
     * Update attendance manually (HR/Admin only)
     */
    async updateAttendance(attendanceId, data) {
        const attendance = await prisma_1.default.trainingAttendance.findUnique({
            where: { id: attendanceId }
        });
        if (!attendance) {
            throw new appError_1.AppError('Attendance record not found', 404);
        }
        if (attendance.isLocked) {
            throw new appError_1.AppError('Attendance is locked and cannot be modified', 400);
        }
        return prisma_1.default.trainingAttendance.update({
            where: { id: attendanceId },
            data,
            include: {
                enrollment: {
                    include: {
                        employee: true,
                        training: true
                    }
                }
            }
        });
    }
    /**
     * Create or update attendance manually by enrollmentId (HR/Admin only)
     */
    async createOrUpdateAttendanceByEnrollment(enrollmentId, data) {
        // Get enrollment with training info
        const enrollment = await prisma_1.default.trainingEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                training: true,
                employee: true
            }
        });
        if (!enrollment) {
            throw new appError_1.AppError('Enrollment not found', 404);
        }
        if (enrollment.status !== 'APPROVED') {
            throw new appError_1.AppError('Only approved enrollments can have attendance records', 400);
        }
        // Check if attendance already exists
        const existingAttendance = await prisma_1.default.trainingAttendance.findUnique({
            where: { enrollmentId }
        });
        if (existingAttendance) {
            if (existingAttendance.isLocked) {
                throw new appError_1.AppError('Attendance is locked and cannot be modified', 400);
            }
            // Update existing attendance
            return prisma_1.default.trainingAttendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status: data.status,
                    timeIn: data.timeIn || existingAttendance.timeIn || (data.status !== 'ABSENT' ? new Date() : undefined),
                    location: data.location || existingAttendance.location
                },
                include: {
                    enrollment: {
                        include: {
                            employee: true,
                            training: true
                        }
                    }
                }
            });
        }
        else {
            // Create new attendance record
            return prisma_1.default.trainingAttendance.create({
                data: {
                    enrollmentId: enrollment.id,
                    status: data.status,
                    timeIn: data.status !== 'ABSENT' ? (data.timeIn || new Date()) : undefined,
                    location: data.location
                },
                include: {
                    enrollment: {
                        include: {
                            employee: true,
                            training: true
                        }
                    }
                }
            });
        }
    }
    /**
     * Lock attendance after training ends
     */
    async lockAttendanceForCompletedTraining(trainingId) {
        const training = await prisma_1.default.training.findUnique({
            where: { id: trainingId },
            include: {
                enrollments: {
                    include: {
                        attendance: true
                    }
                }
            }
        });
        if (!training) {
            throw new appError_1.AppError('Training not found', 404);
        }
        // Lock all attendance records
        const updatePromises = training.enrollments
            .filter(e => e.attendance && !e.attendance.isLocked)
            .map(e => prisma_1.default.trainingAttendance.update({
            where: { id: e.attendance.id },
            data: { isLocked: true }
        }));
        await Promise.all(updatePromises);
        return { locked: updatePromises.length };
    }
    /**
     * Determine attendance status based on time
     */
    determineAttendanceStatus(trainingStartDate) {
        const now = new Date();
        const start = new Date(trainingStartDate);
        const lateThreshold = new Date(start);
        lateThreshold.setMinutes(lateThreshold.getMinutes() + 15); // 15 minutes grace period
        if (now <= lateThreshold) {
            return client_1.AttendanceStatus.PRESENT;
        }
        else {
            return client_1.AttendanceStatus.LATE;
        }
    }
}
exports.TrainingAttendanceService = TrainingAttendanceService;
