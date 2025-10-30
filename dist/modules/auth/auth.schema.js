"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.authTypeDefs = (0, apollo_server_express_1.gql) `
  type AuthPayload {
    token: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: String
    position: String!
    jobDescription: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    registerUser(data: RegisterInput!): User!
    login(data: LoginInput!): AuthPayload!
  }
`;
//# sourceMappingURL=auth.schema.js.map