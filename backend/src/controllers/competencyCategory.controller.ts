import { Request, Response } from "express";
import { CompetencyCategoryService } from "../services/competencyCategory.service";
import { asyncHandler } from "../utils/asyncHandler";

export class CompetencyCategoryController {
  private categoryService = new CompetencyCategoryService();

  // Create category
  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.createCategory(req.body);
    res.status(201).json({ status: "success", category });
  });

  // Get all categories (optionally filter by job role ID or employee ID)
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const jobRoleId = req.query.jobRoleId as string | undefined;
    const employeeId = req.query.employeeId as string | undefined;
    
    let categories;
    if (employeeId) {
      // Get categories relevant to employee's position
      categories = await this.categoryService.getCategoriesByEmployeePosition(employeeId);
    } else if (jobRoleId) {
      categories = await this.categoryService.getCategoriesByJobRoleId(jobRoleId);
    } else {
      categories = await this.categoryService.getCategories();
    }
    
    res.status(200).json({ status: "success", categories });
  });

  // Get single category by ID
  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.getCategoryById(req.params.id);
    res.status(200).json({ status: "success", category });
  });

  // Update category
  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ status: "success", category });
  });

  // Delete category
  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    await this.categoryService.deleteCategory(req.params.id);
    res.status(200).json({ status: "success", message: "Category deleted successfully" });
  });
}

