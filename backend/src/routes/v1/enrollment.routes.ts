import express from "express";
import { EnrollmentController } from "../../controllers/enrollment.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";

const router = express.Router();
const enrollmentController = new EnrollmentController();

// Protected routes (only Admin/HR/Manager)
router.post("/", enrollmentController.createEnrollment);
router.get("/course/:courseId", enrollmentController.getEnrollmentsByCourse);
router.get("/employee/:employeeId", enrollmentController.getEnrollmentsByEmployee);
router.put("/:id", enrollmentController.updateEnrollment);
router.delete("/:id", enrollmentController.deleteEnrollment);

export default router;
