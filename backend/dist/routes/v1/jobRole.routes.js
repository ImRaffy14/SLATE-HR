"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobRole_controller_1 = require("../../controllers/jobRole.controller");
const bearerAuth_1 = require("../../middlewares/bearerAuth");
const roleAuth_1 = require("../../middlewares/roleAuth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const jobRoleController = new jobRole_controller_1.JobRoleController();
// Job Role CRUD (HR/Admin only)
router.post("/create", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), jobRoleController.createJobRole);
router.get("/list", bearerAuth_1.bearerAuth, jobRoleController.getJobRoles);
router.get("/:id", bearerAuth_1.bearerAuth, jobRoleController.getJobRoleById);
router.put("/update/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), jobRoleController.updateJobRole);
router.delete("/delete/:id", bearerAuth_1.bearerAuth, (0, roleAuth_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HR]), jobRoleController.deleteJobRole);
exports.default = router;
