"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const account_controller_1 = require("../../controllers/account.controller");
const multer_1 = __importDefault(require("../../middlewares/multer"));
const router = express_1.default.Router();
const userController = new account_controller_1.UserController();
router.get("/list", userController.getUser);
router.put("/edit/:id", multer_1.default.single("image"), userController.editUser);
router.put("/changePassword/:id", userController.changePassword);
router.delete("/delete/:id", userController.deleteUser);
exports.default = router;
