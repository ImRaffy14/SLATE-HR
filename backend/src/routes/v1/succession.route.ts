import express from "express";
import { SuccessionController } from "../../controllers/succession.controller";

const router = express.Router();
const successionController = new SuccessionController();

// Succession planning routes
router.post("/", successionController.createSuccessionPlan);
router.get("/", successionController.getAllSuccessionPlans);
router.get("/employee/:employeeId", successionController.getSuccessionByEmployee);
router.put("/:id", successionController.updateSuccessionPlan);
router.delete("/:id", successionController.deleteSuccessionPlan);

export default router;
