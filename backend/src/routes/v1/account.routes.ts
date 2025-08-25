import express from "express";
import { UserController } from "../../controllers/account.controller";
import upload from "../../middlewares/multer";
import { bearerAuth } from "../../middlewares/bearerAuth";

const router = express.Router();
const userController = new UserController();

router.get("/list", userController.getUser);
router.put("/edit/:id", upload.single("image"), userController.editUser);
router.put("/changePassword/:id", userController.changePassword);
router.delete("/delete/:id", userController.deleteUser);

export default router;
