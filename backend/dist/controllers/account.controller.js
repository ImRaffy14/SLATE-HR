"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const account_service_1 = require("../services/account.service");
const asyncHandler_1 = require("../utils/asyncHandler");
class UserController {
    constructor() {
        this.userService = new account_service_1.UserService();
        this.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this.userService.getUserService();
            res.status(200).json({
                status: "success",
                user,
            });
        });
        this.editUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const data = req.body;
            const image = req.file;
            const id = req.params.id;
            console.log(req.body);
            const updatedUser = await this.userService.editUserService(data, id, image);
            res.status(200).json({
                status: "success",
                message: "User updated successfully",
                user: updatedUser,
            });
        });
        this.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { password } = req.body;
            const id = req.params.id;
            const updatedUser = await this.userService.changePasswordService(password, id);
            res.status(200).json({
                status: "success",
                message: "Password updated successfully",
                user: updatedUser,
            });
        });
        this.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const id = req.params.id;
            const deletedUser = await this.userService.deleteUserService(id);
            res.status(200).json({
                status: "success",
                message: "User deleted successfully",
                user: deletedUser,
            });
        });
    }
}
exports.UserController = UserController;
