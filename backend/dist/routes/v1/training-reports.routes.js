"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_controller_1 = require("../../modules/training/controllers/report.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const router = express_1.default.Router();
const reportController = new report_controller_1.TrainingReportController();
// Report endpoints
router.get('/training-hours', bearerAuth_1.bearerAuth, reportController.getTrainingHoursReport);
router.get('/attendance', bearerAuth_1.bearerAuth, reportController.getAttendanceSummaryReport);
router.get('/competency-improvement', bearerAuth_1.bearerAuth, reportController.getCompetencyImprovementReport);
router.get('/trainer-effectiveness', bearerAuth_1.bearerAuth, reportController.getTrainerEffectivenessReport);
exports.default = router;
