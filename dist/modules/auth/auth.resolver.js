"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResolvers = void 0;
const user_service_1 = require("../users/user.service");
const apollo_server_express_1 = require("apollo-server-express");
const auth_service_1 = require("./auth.service");
exports.authResolvers = {
    Query: {
        me: async (_, __, ctx) => {
            if (!ctx.user)
                throw new apollo_server_express_1.AuthenticationError('Not authenticated');
            try {
                return await user_service_1.UserService.getById(ctx.user.id);
            }
            catch (err) {
                if (err instanceof user_service_1.NotFoundError)
                    throw new apollo_server_express_1.ApolloError(err.message, 'NOT_FOUND');
                throw new apollo_server_express_1.ApolloError('Internal server error');
            }
        },
    },
    Mutation: {
        registerUser: async (_, { data }) => {
            try {
                return await auth_service_1.AuthService.register(data);
            }
            catch (err) {
                if (err instanceof user_service_1.ConflictError)
                    throw new apollo_server_express_1.ApolloError(err.message, 'CONFLICT');
                throw new apollo_server_express_1.ApolloError('Internal server error');
            }
        },
        login: async (_, { data }) => {
            try {
                const token = await auth_service_1.AuthService.login(data.email, data.password);
                return { token };
            }
            catch (err) {
                if (err instanceof user_service_1.AuthenticationError)
                    throw new apollo_server_express_1.AuthenticationError(err.message);
                throw new apollo_server_express_1.ApolloError('Internal server error');
            }
        },
    },
};
//# sourceMappingURL=auth.resolver.js.map