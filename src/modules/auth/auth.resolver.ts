import { AuthService } from "./auth.service";
import { GraphQLError } from "graphql";
import { GraphQLContext, ResolverParent } from "../../interfaces";
import { RegisterInput, LoginInput } from "./auth.validation";

export const authResolvers = {
  Query: {
    me: async (_parent: ResolverParent, _args: Record<string, never>, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return await AuthService.getMe(context.user.id);
    },
  },
  Mutation: {
    register: async (_parent: ResolverParent, { input }: { input: RegisterInput }) => {
      const result = await AuthService.register({
        name: input.name,
        email: input.email,
        password: input.password,
        position: input.position,
        jobDescription: input.jobDescription,
      });
      return result;
    },
    login: async (_parent: ResolverParent, { input }: { input: LoginInput }) => {
      const result = await AuthService.login(input.email, input.password);
      return result;
    },
  },
};
