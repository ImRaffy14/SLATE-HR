"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const employee_service_1 = require("../services/employee.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class EmployeeController {
    constructor() {
        this.employeeService = new employee_service_1.EmployeeService();
        this.getEmployees = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const employees = await this.employeeService.getEmployeesService();
            res.status(200).json({
                status: "success",
                employees,
            });
        });
        this.getEmployeeById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const employee = await this.employeeService.getEmployeeByIdService(id);
            res.status(200).json({
                status: "success",
                employee,
            });
        });
        this.createEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const data = req.body;
            const newEmployee = await this.employeeService.createEmployeeService(data);
            res.status(201).json({
                status: "success",
                message: "Employee created successfully",
                employee: newEmployee,
            });
        });
        this.updateEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const data = req.body;
            const updatedEmployee = await this.employeeService.updateEmployeeService(id, data);
            res.status(200).json({
                status: "success",
                message: "Employee updated successfully",
                employee: updatedEmployee,
            });
        });
        this.deleteEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const deletedEmployee = await this.employeeService.deleteEmployeeService(id);
            res.status(200).json({
                status: "success",
                message: "Employee deleted successfully",
                employee: deletedEmployee,
            });
        });
    }
}
exports.EmployeeController = EmployeeController;
