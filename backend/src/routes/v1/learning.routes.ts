import express from "express";
import { LearningController } from "../../controllers/learning.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";

const router = express.Router();
const learningController = new LearningController();

// Courses
router.get("/courses", learningController.getCourses);
router.get("/courses/:id", learningController.getCourseById);
router.post("/courses", learningController.createCourse);
router.put("/courses/:id", learningController.updateCourse);
router.delete("/courses/:id", learningController.deleteCourse);

// Enrollments
router.post("/enrollments", learningController.enrollEmployee);
router.put("/enrollments/:id", learningController.updateEnrollmentStatus);

// Feedback
router.post("/feedback", learningController.addFeedback);
router.get("/feedback/:courseId", learningController.getCourseFeedback);

export default router;
