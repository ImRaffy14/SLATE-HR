import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRole.service";
import { asyncHandler } from "../utils/asyncHandler";

export class JobRoleController {
  private jobRoleService = new JobRoleService();

  // Create job role
  createJobRole = asyncHandler(async (req: Request, res: Response) => {
    const jobRole = await this.jobRoleService.createJobRole(req.body);
    res.status(201).json({ status: "success", jobRole });
  });

  // Get all job roles
  getJobRoles = asyncHandler(async (req: Request, res: Response) => {
    const jobRoles = await this.jobRoleService.getJobRoles();
    res.status(200).json({ status: "success", jobRoles });
  });

  // Get single job role by ID
  getJobRoleById = asyncHandler(async (req: Request, res: Response) => {
    const jobRole = await this.jobRoleService.getJobRoleById(req.params.id);
    res.status(200).json({ status: "success", jobRole });
  });

  // Update job role
  updateJobRole = asyncHandler(async (req: Request, res: Response) => {
    const jobRole = await this.jobRoleService.updateJobRole(req.params.id, req.body);
    res.status(200).json({ status: "success", jobRole });
  });

  // Delete job role
  deleteJobRole = asyncHandler(async (req: Request, res: Response) => {
    await this.jobRoleService.deleteJobRole(req.params.id);
    res.status(200).json({ status: "success", message: "Job role deleted successfully" });
  });
}

