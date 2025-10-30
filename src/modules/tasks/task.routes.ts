import { Router } from "express";
import { TaskController } from "./task.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Create a new task
router.post("/", TaskController.createTask);

// Get all tasks (filtered by role in service)
router.get("/", TaskController.getAllTasks);

// Get task by ID
router.get("/:id", TaskController.getTaskById);

// Update task
router.put("/:id", TaskController.updateTask);

// Delete task
router.delete("/:id", TaskController.deleteTask);

// Assign task to user (admin only - checked in service/controller)
router.post("/:id/assign", TaskController.assignTask);

export default router;
