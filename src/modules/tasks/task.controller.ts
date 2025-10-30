import { Request, Response, NextFunction } from "express";
import { TaskService } from "./task.service";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  AssignTaskSchema,
} from "./task.validation";
import { z } from "zod";
import { NotFoundError, ForbiddenError } from "./task.service";

export class TaskController {
  /**
   * Create a new task
   * POST /tasks
   */
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = CreateTaskSchema.parse(req.body);
      const task = await TaskService.createTask(validated);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  /**
   * Get all tasks (filtered by role)
   * GET /tasks
   */
  static async getAllTasks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const tasks = await TaskService.getAllTasks(req.user.role, req.user.id);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task by ID
   * GET /tasks/:id
   */
  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const task = await TaskService.getTaskById(
        req.params.id,
        req.user.role,
        req.user.id
      );
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  /**
   * Update task
   * PUT /tasks/:id
   */
  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const validated = UpdateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(
        req.params.id,
        validated,
        req.user.role,
        req.user.id
      );
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  /**
   * Delete task
   * DELETE /tasks/:id
   */
  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      await TaskService.deleteTask(req.params.id, req.user.role, req.user.id);
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  /**
   * Assign task to user (admin only)
   * POST /tasks/:id/assign
   */
  static async assignTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const validated = AssignTaskSchema.parse(req.body);
      const task = await TaskService.assignTask(
        req.params.id,
        validated.assignedTo,
        req.user.role
      );
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof ForbiddenError) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }
}
