"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollment_controller_1 = require("../../modules/training/controllers/enrollment.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const enrollmentController = new enrollment_controller_1.TrainingEnrollmentController();
// Enrollment endpoints
router.get('/training/:trainingId', bearerAuth_1.bearerAuth, enrollmentController.getTrainingEnrollments);
router.get('/employee/:id/trainings', bearerAuth_1.bearerAuth, enrollmentController.getEmployeeTrainings);
router.get('/pending', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), enrollmentController.getPendingEnrollments);
router.patch('/:id/approve', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), enrollmentController.approveEnrollment);
router.patch('/:id/reject', bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR, client_1.UserRole.MANAGER]), enrollmentController.rejectEnrollment);
exports.default = router;
