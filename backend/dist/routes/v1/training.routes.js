"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const training_controller_1 = require("../../modules/training/controllers/training.controller");
const enrollment_controller_1 = require("../../modules/training/controllers/enrollment.controller");
const attendance_controller_1 = require("../../modules/training/controllers/attendance.controller");
const evaluation_controller_1 = require("../../modules/training/controllers/evaluation.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const trainingController = new training_controller_1.TrainingController();
const enrollmentController = new enrollment_controller_1.TrainingEnrollmentController();
const attendanceController = new attendance_controller_1.TrainingAttendanceController();
const evaluationController = new evaluation_controller_1.TrainingEvaluationController();
// Training CRUD (HR/Admin only for create/update/delete)
router.post('/', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), trainingController.createTraining);
router.get('/', bearerAuth_1.bearerAuth, trainingController.getTrainings);
router.get('/trainers', bearerAuth_1.bearerAuth, trainingController.getTrainers);
router.get('/venues', bearerAuth_1.bearerAuth, trainingController.getVenues);
router.get('/suggestions/:employeeId', bearerAuth_1.bearerAuth, trainingController.suggestTrainings);
router.get('/:id', bearerAuth_1.bearerAuth, trainingController.getTrainingById);
router.put('/:id', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), trainingController.updateTraining);
router.delete('/:id', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), trainingController.deleteTraining);
// Enrollment route (nested under training)
router.post('/:id/enroll', bearerAuth_1.bearerAuth, enrollmentController.createEnrollment);
// Attendance routes (nested under training)
router.post('/:id/qr', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), attendanceController.generateQRCode);
router.post('/:id/attendance/scan', bearerAuth_1.bearerAuth, attendanceController.scanQRCode);
router.get('/:id/attendance', bearerAuth_1.bearerAuth, attendanceController.getAttendanceList);
// Evaluation routes (nested under training)
router.get('/:id/evaluations', bearerAuth_1.bearerAuth, evaluationController.getTrainingEvaluations);
exports.default = router;
