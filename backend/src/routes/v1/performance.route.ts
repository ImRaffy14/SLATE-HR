import express from "express";
import { PerformanceController } from "../../controllers/performance.controller";

const router = express.Router();
const performanceController = new PerformanceController();

// Employee-level analysis
router.get("/employee/:employeeId", performanceController.analyzeEmployeePerformance);

// Organization-wide analytics
router.get("/analytics", performanceController.getOrgPerformanceAnalytics);

export default router;
