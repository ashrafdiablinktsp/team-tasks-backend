import { TaskWithUser, taskDAL, Task } from "./task.model";
import { userDAL } from "../users/user.model";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class TaskService {
  /**
   * Create a new task
   * @param data Task creation data
   * @param creatorId ID of the user creating the task
   */
  static async createTask(data: {
    title: string;
    description?: string;
    assignedTo?: string;
  }): Promise<TaskWithUser> {
    // If assignedTo is provided, verify the user exists
    if (data.assignedTo) {
      const assignee = await userDAL.findById(data.assignedTo);
      if (!assignee) {
        throw new NotFoundError("Assigned user not found");
      }
    }

    const task = await taskDAL.create(
      data.title,
      data.description,
      data.assignedTo
    );

    // Fetch with user details
    const taskWithUser = await taskDAL.findByIdWithUser(task.id);
    if (!taskWithUser) {
      throw new NotFoundError("Task creation failed");
    }

    console.log("Task created successfully:", task.id);
    return taskWithUser;
  }

  /**
   * Get all tasks with authorization
   * @param role User role ('admin' or 'user')
   * @param userId ID of the requesting user
   */
  static async getAllTasks(
    role: string,
    userId: string
  ): Promise<TaskWithUser[]> {
    if (role === "admin") {
      // Admin can see all tasks
      return await taskDAL.findAllWithUsers();
    } else {
      // Regular users can only see tasks assigned to them
      return await taskDAL.findByAssignedToWithUser(userId);
    }
  }

  /**
   * Get a single task by ID with authorization
   * @param taskId Task ID
   * @param role User role
   * @param userId ID of the requesting user
   */
  static async getTaskById(
    taskId: string,
    role: string,
    userId: string
  ): Promise<TaskWithUser> {
    const task = await taskDAL.findByIdWithUser(taskId);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    // Authorization check
    if (role !== "admin" && task.assignedTo !== userId) {
      throw new ForbiddenError("You do not have permission to view this task");
    }

    return task;
  }

  /**
   * Update a task with authorization
   * @param taskId Task ID
   * @param data Update data
   * @param role User role
   * @param userId ID of the requesting user
   */
  static async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
      assignedTo?: string | null;
    },
    role: string,
    userId: string
  ): Promise<TaskWithUser> {
    // First, fetch the existing task and check authorization
    const existingTask = await taskDAL.findById(taskId);

    if (!existingTask) {
      throw new NotFoundError("Task not found");
    }

    // Authorization check
    if (role !== "admin" && existingTask.assignedTo !== userId) {
      throw new ForbiddenError("You do not have permission to update this task");
    }

    // If updating assignedTo, verify the new user exists
    if (data.assignedTo !== undefined && data.assignedTo !== null) {
      const assignee = await userDAL.findById(data.assignedTo);
      if (!assignee) {
        throw new NotFoundError("Assigned user not found");
      }
    }

    // Update the task
    const updateData: Record<string, string | null | undefined> = { ...data };
    if (data.assignedTo === null) {
      updateData.assignedTo = undefined;
    }
    
    const updated = await taskDAL.update(taskId, updateData as Partial<Omit<Task, "id" | "createdAt">>);

    if (!updated) {
      throw new NotFoundError("Task update failed");
    }

    // Fetch with user details
    const taskWithUser = await taskDAL.findByIdWithUser(updated.id);
    if (!taskWithUser) {
      throw new NotFoundError("Task not found after update");
    }

    console.log("Task updated:", taskId);
    return taskWithUser;
  }

  /**
   * Delete a task with authorization
   * @param taskId Task ID
   * @param role User role
   * @param userId ID of the requesting user
   */
  static async deleteTask(
    taskId: string,
    role: string,
    userId: string
  ): Promise<void> {
    // First, fetch the existing task and check authorization
    const existingTask = await taskDAL.findById(taskId);

    if (!existingTask) {
      throw new NotFoundError("Task not found");
    }

    // Authorization check
    if (role !== "admin" && existingTask.assignedTo !== userId) {
      throw new ForbiddenError("You do not have permission to delete this task");
    }

    const deleted = await taskDAL.delete(taskId);

    if (!deleted) {
      throw new NotFoundError("Task deletion failed");
    }

    console.log("Task deleted:", taskId);
  }

  /**
   * Assign a task to a user (admin only)
   * @param taskId Task ID
   * @param assignedTo User ID to assign to
   * @param adminRole Role of the requester
   */
  static async assignTask(
    taskId: string,
    assignedTo: string,
    adminRole: string
  ): Promise<TaskWithUser> {
    // Authorization: Only admins can assign tasks
    if (adminRole !== "admin") {
      throw new ForbiddenError("Only admins can assign tasks");
    }

    // Verify the task exists
    const task = await taskDAL.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    // Verify the user exists
    const user = await userDAL.findById(assignedTo);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update the task assignment
    const updated = await taskDAL.update(taskId, { assignedTo });

    if (!updated) {
      throw new NotFoundError("Task assignment failed");
    }

    // Fetch with user details
    const taskWithUser = await taskDAL.findByIdWithUser(updated.id);
    if (!taskWithUser) {
      throw new NotFoundError("Task not found after assignment");
    }

    console.log(`Task ${taskId} assigned to user ${assignedTo}`);
    return taskWithUser;
  }

  /**
   * Get task statistics by status
   * @param role User role ('admin' or 'user')
   * @param userId ID of the requesting user
   */
  static async getTaskStats(
    role: string,
    userId: string
  ): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    total: number;
  }> {
    return await taskDAL.getTaskStats(role, userId);
  }
}
