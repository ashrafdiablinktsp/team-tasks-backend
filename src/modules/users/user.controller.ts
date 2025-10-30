import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { CreateUserSchema, UpdateUserSchema } from "./user.validation";
import { z } from "zod";

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = CreateUserSchema.parse(req.body);
      const user = await UserService.create(validated);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        });
      } else {
        next(error);
      }
    }
  }

  static async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAll();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = UpdateUserSchema.parse(req.body);
      const user = await UserService.update(req.params.id, validated);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        });
      } else {
        next(error);
      }
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
