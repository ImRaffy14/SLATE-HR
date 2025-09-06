import express from "express";
import { CompetencyController } from "../../controllers/competency.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";

const router = express.Router();
const competencyController = new CompetencyController();

router.post("/create", competencyController.createCompetency);
router.get("/list", competencyController.getCompetencies);
router.put("/update/:id", competencyController.updateCompetency);
router.delete("/delete/:id", competencyController.deleteCompetency);

// assessments
router.post("/assessment", competencyController.addAssessment);

// analytics
router.get("/analytics", competencyController.getAnalytics);

export default router;
