import { TaskService, NotFoundError, ForbiddenError } from "./task.service";
import { GraphQLError } from "graphql";
import { GraphQLContext, ResolverParent } from "../../interfaces";
import { CreateTaskInput, UpdateTaskInput, AssignTaskInput } from "./task.validation";

export const taskResolvers = {
  Query: {
    /**
     * Get all tasks (filtered by role)
     */
    tasks: async (_parent: ResolverParent, _args: Record<string, never>, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await TaskService.getAllTasks(context.user.role, context.user.id);
      } catch (error) {
        throw new GraphQLError("Failed to fetch tasks", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    /**
     * Get a single task by ID
     */
    task: async (_parent: ResolverParent, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await TaskService.getTaskById(id, context.user.role, context.user.id);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "NOT_FOUND" },
          });
        }
        if (error instanceof ForbiddenError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "FORBIDDEN" },
          });
        }
        throw new GraphQLError("Failed to fetch task", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    /**
     * Get task statistics
     */
    taskStats: async (_parent: ResolverParent, _args: Record<string, never>, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await TaskService.getTaskStats(context.user.role, context.user.id);
      } catch (error) {
        throw new GraphQLError("Failed to fetch task statistics", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  Mutation: {
    /**
     * Create a new task
     */
    createTask: async (_parent: ResolverParent, { input }: { input: CreateTaskInput }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await TaskService.createTask(input);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "NOT_FOUND" },
          });
        }
        throw new GraphQLError("Failed to create task", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    /**
     * Update a task
     */
    updateTask: async (
      _parent: ResolverParent,
      { id, input }: { id: string; input: UpdateTaskInput },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await TaskService.updateTask(
          id,
          input,
          context.user.role,
          context.user.id
        );
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "NOT_FOUND" },
          });
        }
        if (error instanceof ForbiddenError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "FORBIDDEN" },
          });
        }
        throw new GraphQLError("Failed to update task", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    /**
     * Delete a task
     */
    deleteTask: async (_parent: ResolverParent, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        await TaskService.deleteTask(id, context.user.role, context.user.id);
        return true;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "NOT_FOUND" },
          });
        }
        if (error instanceof ForbiddenError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "FORBIDDEN" },
          });
        }
        throw new GraphQLError("Failed to delete task", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    /**
     * Assign a task to a user (admin only)
     */
    assignTask: async (
      _parent: ResolverParent,
      { id, input }: { id: string; input: AssignTaskInput },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await TaskService.assignTask(
          id,
          input.assignedTo,
          context.user.role
        );
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "NOT_FOUND" },
          });
        }
        if (error instanceof ForbiddenError) {
          throw new GraphQLError(error.message, {
            extensions: { code: "FORBIDDEN" },
          });
        }
        throw new GraphQLError("Failed to assign task", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
