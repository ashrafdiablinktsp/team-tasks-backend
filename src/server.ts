import { app } from "./app";
import { connectDB } from "./config/database";
import { config } from "./config/env";
import { ApolloServer } from "apollo-server-express";
import { userTypeDefs } from "./modules/users/user.schema";
import { authTypeDefs } from "./modules/auth/auth.schema";
import { taskTypeDefs } from "./modules/tasks/task.schema";
import { userResolvers } from "./modules/users/user.resolver";
import { authResolvers } from "./modules/auth/auth.resolver";
import { taskResolvers } from "./modules/tasks/task.resolver";
import jwt from "jsonwebtoken";
import { JWTPayload } from "./interfaces";
import { logger } from "./utils/logger";

const BEARER_PREFIX = 'Bearer ';

function getAuthContext({ req }: { req: { headers: { authorization?: string } } }) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith(BEARER_PREFIX)) {
    return {};
  }

  const token = authHeader.replace(BEARER_PREFIX, '');
  
  try {
    const user = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    logger.info('GraphQL request authenticated', { userId: user.id, role: user.role });
    return { user };
  } catch (error) {
    logger.warn('Invalid JWT token in GraphQL request');
    return {};
  }
}

async function startServer() {
  try {
    logger.info('Initializing database...');
    await connectDB();
    logger.info('Database initialized successfully');
    
    const server = new ApolloServer({
      typeDefs: [userTypeDefs, authTypeDefs, taskTypeDefs],
      resolvers: [userResolvers, authResolvers, taskResolvers],
      context: getAuthContext,
    });

    await server.start();
    server.applyMiddleware({ app: app as never, path: '/graphql' });
    
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
      logger.info(`GraphQL Playground: http://localhost:${config.PORT}/graphql`);
      logger.info(`REST API: http://localhost:${config.PORT}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
