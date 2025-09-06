import { Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";
import { asyncHandler } from "../utils/asyncHandler";

export class EmployeeController {
  private employeeService = new EmployeeService();

  getEmployees = asyncHandler(async (req: Request, res: Response) => {
    const employees = await this.employeeService.getEmployeesService();
    res.status(200).json({
      status: "success",
      employees,
    });
  });

  getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const employee = await this.employeeService.getEmployeeByIdService(id);
    res.status(200).json({
      status: "success",
      employee,
    });
  });

  createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const newEmployee = await this.employeeService.createEmployeeService(data);
    res.status(201).json({
      status: "success",
      message: "Employee created successfully",
      employee: newEmployee,
    });
  });

  updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const updatedEmployee = await this.employeeService.updateEmployeeService(id, data);
    res.status(200).json({
      status: "success",
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  });

  deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedEmployee = await this.employeeService.deleteEmployeeService(id);
    res.status(200).json({
      status: "success",
      message: "Employee deleted successfully",
      employee: deletedEmployee,
    });
  });
}
