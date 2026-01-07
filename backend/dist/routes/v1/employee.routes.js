"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("../../controllers/employee.controller");
const router = express_1.default.Router();
const employeeController = new employee_controller_1.EmployeeController();
router.get("/list", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/create", employeeController.createEmployee);
router.put("/update/:id", employeeController.updateEmployee);
router.delete("/delete/:id", employeeController.deleteEmployee);
exports.default = router;
