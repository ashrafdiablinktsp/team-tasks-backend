"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.userTypeDefs = (0, apollo_server_express_1.gql) `
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    position: String!
    jobDescription: String
    createdAt: String!
    updatedAt: String!
  }


  input UpdateInput {
    name: String
    email: String
    password: String
    role: String
    position: String
    jobDescription: String
  }


  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    updateUser(id: ID!, data: UpdateInput!): User!
  }
`;
//# sourceMappingURL=user.schema.js.map