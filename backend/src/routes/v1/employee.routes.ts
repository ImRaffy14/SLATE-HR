import express from "express";
import { EmployeeController } from "../../controllers/employee.controller";
import { bearerAuth } from "../../middlewares/bearerAuth";

const router = express.Router();
const employeeController = new EmployeeController();

router.get("/list", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/create", employeeController.createEmployee);
router.put("/update/:id", employeeController.updateEmployee);
router.delete("/delete/:id", employeeController.deleteEmployee);

export default router;
