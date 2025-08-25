import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { RegisterUser, LoginUser } from "../types";
import { UserRole } from "@prisma/client";
import { AppError } from "../utils/appError";
import { generateToken } from "../utils/token";
import { uploadImage } from "./imageUploadService";

export class AuthService {
  async registerService(data: RegisterUser, image: any) {
    const { name, email, password, role } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    if (!image) {
      throw new AppError("Image is required", 400);
    }

    const result = await uploadImage(image.buffer, "users-avatar");
    if (!result) {
      throw new AppError("Image upload failed", 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        image: {
          imageUrl: result.url,
          publicId: result.public_id,
        },
      },
    });

    return user;
  }

  async loginService(data: LoginUser) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return { token };
  }
}
