import express from "express";
import { JobRoleController } from "../../controllers/jobRole.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";
import { requireRole } from "../../middlewares/roleAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();
const jobRoleController = new JobRoleController();

// Job Role CRUD (HR/Admin only)
router.post("/create", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), jobRoleController.createJobRole);
router.get("/list", bearerAuth, jobRoleController.getJobRoles);
router.get("/:id", bearerAuth, jobRoleController.getJobRoleById);
router.put("/update/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), jobRoleController.updateJobRole);
router.delete("/delete/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), jobRoleController.deleteJobRole);

export default router;

