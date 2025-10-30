import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(1000).optional(),
  assignedTo: z.string().uuid("Invalid user ID").optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  assignedTo: z.string().uuid("Invalid user ID").optional().nullable(),
});

export const AssignTaskSchema = z.object({
  assignedTo: z.string().uuid("Invalid user ID"),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type AssignTaskInput = z.infer<typeof AssignTaskSchema>;
