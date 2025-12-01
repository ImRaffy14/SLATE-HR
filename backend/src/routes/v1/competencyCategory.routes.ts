import express from "express";
import { CompetencyCategoryController } from "../../controllers/competencyCategory.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";
import { requireRole } from "../../middlewares/roleAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();
const categoryController = new CompetencyCategoryController();

// Category CRUD (HR/Admin only)
router.post("/create", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), categoryController.createCategory);
router.get("/list", bearerAuth, categoryController.getCategories);
router.get("/:id", bearerAuth, categoryController.getCategoryById);
router.put("/update/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), categoryController.updateCategory);
router.delete("/delete/:id", bearerAuth, requireRole([UserRole.ADMIN, UserRole.HR]), categoryController.deleteCategory);

export default router;

