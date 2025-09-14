import { Request, Response } from "express";
import { SuccessionService } from "../services/succession.service";
import { asyncHandler } from "../utils/asyncHandler";

export class SuccessionController {
  private successionService = new SuccessionService();

  // Create succession plan entry
  createSuccessionPlan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const plan = await this.successionService.createSuccessionPlanService(
      req.body,
       userId,
    );
    res.status(201).json({
      status: "success",
      message: "Succession plan created successfully",
      plan,
    });
  });

  // Get all succession plans
  getAllSuccessionPlans = asyncHandler(async (req: Request, res: Response) => {
    const plans = await this.successionService.getAllSuccessionPlansService();
    res.status(200).json({
      status: "success",
      plans,
    });
  });

  // Get succession plan by employee
  getSuccessionByEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const plan = await this.successionService.getSuccessionByEmployeeService(employeeId);
    res.status(200).json({
      status: "success",
      plan,
    });
  });

  // Update succession plan
  updateSuccessionPlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await this.successionService.updateSuccessionPlanService(id, req.body);
    res.status(200).json({
      status: "success",
      message: "Succession plan updated successfully",
      plan: updated,
    });
  });

  // Delete succession plan
  deleteSuccessionPlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await this.successionService.deleteSuccessionPlanService(id);
    res.status(200).json({
      status: "success",
      message: "Succession plan deleted successfully",
      plan: deleted,
    });
  });
}
