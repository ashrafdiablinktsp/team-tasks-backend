"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const user_service_1 = require("./user.service");
const apollo_server_express_1 = require("apollo-server-express");
exports.userResolvers = {
    Query: {
        users: async (_, __, ctx) => {
            if (!ctx.user || ctx.user.role !== 'admin')
                throw new apollo_server_express_1.ForbiddenError('Forbidden');
            try {
                return await user_service_1.UserService.getAll();
            }
            catch {
                throw new apollo_server_express_1.ApolloError('Internal server error');
            }
        },
        user: async (_, { id }) => {
            try {
                return await user_service_1.UserService.getById(id);
            }
            catch (err) {
                if (err instanceof user_service_1.NotFoundError)
                    throw new apollo_server_express_1.ApolloError(err.message, 'NOT_FOUND');
                throw new apollo_server_express_1.ApolloError('Internal server error');
            }
        },
    },
    Mutation: {
        updateUser: async (_, { id, data }, ctx) => {
            if (!ctx.user || (ctx.user.id !== id && ctx.user.role !== 'admin'))
                throw new apollo_server_express_1.ForbiddenError('Forbidden');
            try {
                return await user_service_1.UserService.update(id, data);
            }
            catch (err) {
                if (err instanceof user_service_1.NotFoundError)
                    throw new apollo_server_express_1.ApolloError(err.message, 'NOT_FOUND');
                if (err instanceof user_service_1.ConflictError)
                    throw new apollo_server_express_1.ApolloError(err.message, 'CONFLICT');
                throw new apollo_server_express_1.ApolloError('Internal server error');
            }
        },
    },
};
//# sourceMappingURL=user.resolver.js.map