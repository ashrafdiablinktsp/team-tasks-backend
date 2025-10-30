import { UserService } from "./user.service";
import { GraphQLError } from "graphql";
import { GraphQLContext, ResolverParent, UpdateUserInput } from "../../interfaces";
import { CreateUserInput } from "./user.validation";

export const userResolvers = {
  Query: {
    users: async () => {
      return await UserService.getAll();
    },
    user: async (_parent: ResolverParent, { id }: { id: string }) => {
      return await UserService.getById(id);
    },
  },
  Mutation: {
    createUser: async (_parent: ResolverParent, { input }: { input: CreateUserInput }, context: GraphQLContext) => {
      // Only admins can create users
      if (!context.user || context.user.role !== "admin") {
        throw new GraphQLError("Forbidden: Admin access required", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await UserService.create(input);
    },
    updateUser: async (
      _parent: ResolverParent,
      { id, input }: { id: string; input: UpdateUserInput }
    ) => {
      return await UserService.update(id, input);
    },
    deleteUser: async (_parent: ResolverParent, { id }: { id: string }, context: GraphQLContext) => {
      // Only admins can delete users
      if (!context.user || context.user.role !== "admin") {
        throw new GraphQLError("Forbidden: Admin access required", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      await UserService.delete(id);
      return true;
    },
  },
};
