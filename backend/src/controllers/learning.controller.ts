import { Request, Response } from "express";
import { LearningService } from "../services/learning.service";
import { asyncHandler } from "../utils/asyncHandler";

export class LearningController {
  private learningService = new LearningService();

  // ==============================
  // COURSES
  // ==============================
  getCourses = asyncHandler(async (req: Request, res: Response) => {
    const courses = await this.learningService.getCoursesService();
    res.status(200).json({
      status: "success",
      courses,
    });
  });

  getCourseById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await this.learningService.getCourseByIdService(id);
    res.status(200).json({
      status: "success",
      course,
    });
  });

  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required to create a course",
      });
    }
    const course = await this.learningService.createCourseService(data, userId);
    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      course,
    });
  });

    updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required to update a course",
      });
    }
    const course = await this.learningService.updateCourseService(id, data, userId);
    res.status(200).json({
      status: "success",
      message: "Course updated successfully",
      course,
    });
  });

  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.learningService.deleteCourseService(id);
    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  });

  // ==============================
  // ENROLLMENTS
  // ==============================
  enrollEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, employeeId } = req.body;
    const enrollment = await this.learningService.enrollEmployeeService(courseId, employeeId);
    res.status(201).json({
      status: "success",
      message: "Employee enrolled successfully",
      enrollment,
    });
  });

  updateEnrollmentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, progress } = req.body;
    const enrollment = await this.learningService.updateEnrollmentStatusService(id, status, progress);
    res.status(200).json({
      status: "success",
      message: "Enrollment updated successfully",
      enrollment,
    });
  });

  // ==============================
  // FEEDBACK
  // ==============================
    addFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, employeeId, rating, comment } = req.body; 
    // employeeId is passed explicitly from frontend (admin chooses employee)

    const feedback = await this.learningService.addFeedbackService(
        courseId,
        employeeId,
        rating,
        comment
    );

    res.status(201).json({
        status: "success",
        message: "Feedback submitted successfully",
        feedback,
    });
    });


  getCourseFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const feedback = await this.learningService.getCourseFeedbackService(courseId);
    res.status(200).json({
      status: "success",
      feedback,
    });
  });
}
