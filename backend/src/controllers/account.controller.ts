// controllers/UserController.ts
import { Request, Response } from "express";
import { UserService } from "../services/account.service";
import { asyncHandler } from "../utils/asyncHandler";

export class UserController {

  private userService = new UserService();


  getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getUserService();
    res.status(200).json({
      status: "success",
      user,
    });
  });


  editUser = asyncHandler(async (req: Request, res: Response) => {
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


  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;
    const id = req.params.id;

    const updatedUser = await this.userService.changePasswordService(password, id);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
      user: updatedUser,
    });
  });
  

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    const deletedUser = await this.userService.deleteUserService(id);

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      user: deletedUser,
    });
  });
}
