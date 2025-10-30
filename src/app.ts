import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import taskRoutes from "./modules/tasks/task.routes";

export const app = express();

app.use(cors());

// Apply express.json() to all routes except /graphql
app.use((req, res, next) => {
  if (req.path === '/graphql') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.use(errorHandler);
