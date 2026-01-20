"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetencyCategoryController = void 0;
const competencyCategory_service_1 = require("../services/competencyCategory.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class CompetencyCategoryController {
    constructor() {
        this.categoryService = new competencyCategory_service_1.CompetencyCategoryService();
        // Create category
        this.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const category = await this.categoryService.createCategory(req.body);
            res.status(201).json({ status: "success", category });
        });
        // Get all categories (optionally filter by job role ID or employee ID)
        this.getCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const jobRoleId = req.query.jobRoleId;
            const employeeId = req.query.employeeId;
            let categories;
            if (employeeId) {
                // Get categories relevant to employee's position
                categories = await this.categoryService.getCategoriesByEmployeePosition(employeeId);
            }
            else if (jobRoleId) {
                categories = await this.categoryService.getCategoriesByJobRoleId(jobRoleId);
            }
            else {
                categories = await this.categoryService.getCategories();
            }
            res.status(200).json({ status: "success", categories });
        });
        // Get single category by ID
        this.getCategoryById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const category = await this.categoryService.getCategoryById(req.params.id);
            res.status(200).json({ status: "success", category });
        });
        // Update category
        this.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const category = await this.categoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({ status: "success", category });
        });
        // Delete category
        this.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.categoryService.deleteCategory(req.params.id);
            res.status(200).json({ status: "success", message: "Category deleted successfully" });
        });
    }
}
exports.CompetencyCategoryController = CompetencyCategoryController;
