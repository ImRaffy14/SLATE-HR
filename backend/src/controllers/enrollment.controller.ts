import { Request, Response } from "express";
import { EnrollmentService } from "../services/enrollment.service";
import { asyncHandler } from "../utils/asyncHandler";

export class EnrollmentController {
  private enrollmentService = new EnrollmentService();

  // Enroll an employee to a course
  createEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, courseId } = req.body;
    const enrollment = await this.enrollmentService.createEnrollmentService(employeeId, courseId);

    res.status(201).json({
      status: "success",
      message: "Employee enrolled successfully",
      enrollment,
    });
  });

  // Get all enrollments for a course
  getEnrollmentsByCourse = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const enrollments = await this.enrollmentService.getEnrollmentsByCourseService(courseId);

    res.status(200).json({
      status: "success",
      enrollments,
    });
  });

  // Get all enrollments of an employee
  getEnrollmentsByEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const enrollments = await this.enrollmentService.getEnrollmentsByEmployeeService(employeeId);

    res.status(200).json({
      status: "success",
      enrollments,
    });
  });

  // Update enrollment status/progress
  updateEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body; // { status, progress, lastActivity }
    const updated = await this.enrollmentService.updateEnrollmentService(id, data);

    res.status(200).json({
      status: "success",
      message: "Enrollment updated successfully",
      enrollment: updated,
    });
  });

  // Cancel enrollment
  deleteEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await this.enrollmentService.deleteEnrollmentService(id);

    res.status(200).json({
      status: "success",
      message: "Enrollment deleted successfully",
      enrollment: deleted,
    });
  });
}
