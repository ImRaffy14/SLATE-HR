"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const evaluation_controller_1 = require("../../modules/training/controllers/evaluation.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const router = express_1.default.Router();
const evaluationController = new evaluation_controller_1.TrainingEvaluationController();
// Evaluation endpoints
router.post('/training-evaluation/:enrollmentId', bearerAuth_1.bearerAuth, evaluationController.submitEvaluation);
router.get('/training-evaluation/:enrollmentId', bearerAuth_1.bearerAuth, evaluationController.getEvaluation);
router.get('/trainings/:id/evaluations', bearerAuth_1.bearerAuth, evaluationController.getTrainingEvaluations);
exports.default = router;
