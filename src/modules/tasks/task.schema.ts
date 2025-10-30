import { gql } from "apollo-server-express";

export const taskTypeDefs = gql`
  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    assignedTo: String
    assignedToUser: User
    createdAt: String!
    updatedAt: String!
  }

  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  type TaskStats {
    pending: Int!
    inProgress: Int!
    completed: Int!
    total: Int!
  }

  input CreateTaskInput {
    title: String!
    description: String
    assignedTo: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    assignedTo: String
  }

  input AssignTaskInput {
    assignedTo: String!
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
    taskStats: TaskStats!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    assignTask(id: ID!, input: AssignTaskInput!): Task!
  }
`;
