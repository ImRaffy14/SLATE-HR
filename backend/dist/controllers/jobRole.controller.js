"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRoleController = void 0;
const jobRole_service_1 = require("../services/jobRole.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class JobRoleController {
    constructor() {
        this.jobRoleService = new jobRole_service_1.JobRoleService();
        // Create job role
        this.createJobRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const jobRole = await this.jobRoleService.createJobRole(req.body);
            res.status(201).json({ status: "success", jobRole });
        });
        // Get all job roles
        this.getJobRoles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const jobRoles = await this.jobRoleService.getJobRoles();
            res.status(200).json({ status: "success", jobRoles });
        });
        // Get single job role by ID
        this.getJobRoleById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const jobRole = await this.jobRoleService.getJobRoleById(req.params.id);
            res.status(200).json({ status: "success", jobRole });
        });
        // Update job role
        this.updateJobRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const jobRole = await this.jobRoleService.updateJobRole(req.params.id, req.body);
            res.status(200).json({ status: "success", jobRole });
        });
        // Delete job role
        this.deleteJobRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.jobRoleService.deleteJobRole(req.params.id);
            res.status(200).json({ status: "success", message: "Job role deleted successfully" });
        });
    }
}
exports.JobRoleController = JobRoleController;
