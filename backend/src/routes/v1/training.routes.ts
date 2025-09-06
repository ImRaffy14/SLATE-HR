import express from "express";
import { TrainingController } from "../../controllers/training.controller";

const router = express.Router();
const trainingController = new TrainingController();

// Training sessions
router.post("/session", trainingController.createTrainingSession);
router.get("/session", trainingController.getAllTrainingSessions);
router.get("/session/:id", trainingController.getTrainingSessionById);
router.put("/session/:id", trainingController.updateTrainingSession);
router.delete("/session/:id", trainingController.deleteTrainingSession);

// Training records
router.post("/record", trainingController.addTrainingRecord);
router.get("/record/session/:trainingId", trainingController.getRecordsBySession);
router.get("/record/employee/:employeeId", trainingController.getRecordsByEmployee);
router.put("/record/:id", trainingController.updateTrainingRecord);

export default router;
