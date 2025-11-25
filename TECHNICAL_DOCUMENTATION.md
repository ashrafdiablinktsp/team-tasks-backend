# Team Tasks Backend - Complete Technical Documentation

## 1. Project Overview

### What the Project Does
Team Tasks Backend is a production-grade **Task Management System** API that enables organizations to manage tasks, users, and assignments with role-based access control (RBAC). The system supports both admin and regular user roles, where admins have full control over the system while regular users can only manage their assigned tasks.

### Main Business Logic and Goal
The primary business goal is to provide a secure, scalable API for task delegation and tracking within teams. The system enforces:
- **Authentication & Authorization**: JWT-based authentication with role-based permissions
- **Task Assignment**: Admins can assign tasks to users
- **Task Lifecycle Management**: Track tasks through PENDING → IN_PROGRESS → COMPLETED states
- **User Management**: Comprehensive CRUD operations for user accounts
- **Multi-API Support**: Exposes both RESTful and GraphQL APIs for flexibility

### High-Level Architecture
The system follows a **Layered Monolithic Architecture** with clear separation of concerns:
```
┌─────────────────────────────────────────┐
│         Client Applications             │
│   (REST/GraphQL Consumers)              │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      API Layer (Express + Apollo)       │
│  - REST Endpoints (/api)                │
│  - GraphQL Endpoint (/graphql)          │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Middleware Layer                │
│  - Authentication (JWT)                 │
│  - Authorization (RBAC)                 │
│  - Error Handling                       │
│  - Request Validation                   │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Business Logic Layer              │
│  - Services (Domain Logic)              │
│  - Controllers (Request Handlers)       │
│  - Resolvers (GraphQL Handlers)         │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Data Access Layer (DAL)            │
│  - Models (Data Structures)             │
│  - DAL Functions (Database Operations)  │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Database Layer                  │
│      SQLite (task-management-system.db) │
└─────────────────────────────────────────┘
```

---

## 2. Project Structure

### Root Level Files
- **`package.json`**: Dependencies and npm scripts
- **`tsconfig.json`**: TypeScript compiler configuration (strict mode, ES2022 target)
- **`codegen.yml`**: GraphQL schema generation configuration
- **`.env`**: Environment variables (JWT_SECRET, DATABASE_URL, PORT)

### `src/` Directory Structure

#### **`src/config/`** - Configuration Management
- **`env.ts`**: Environment variable loading and validation using dotenv
- **`database.ts`**: Database connection factory and table initialization

#### **`src/middleware/`** - Request Interceptors
- **`auth.middleware.ts`**: JWT authentication and role-based authorization
- **`error.middleware.ts`**: Global error handler for Express

#### **`src/modules/`** - Feature Modules (Domain-Driven Organization)
Each module follows a consistent structure:
- **`*.model.ts`**: Data Access Layer (DAL) with CRUD operations
- **`*.service.ts`**: Business logic and orchestration
- **`*.controller.ts`**: REST API request handlers
- **`*.resolver.ts`**: GraphQL query/mutation handlers
- **`*.routes.ts`**: Express route definitions
- **`*.schema.ts`**: GraphQL type definitions
- **`*.validation.ts`**: Zod schemas for input validation
- **`*.types.ts`**: TypeScript type definitions (auth only)

**Module Breakdown:**
1. **`modules/auth/`**: User registration, login, token generation
2. **`modules/users/`**: User CRUD operations, profile management
3. **`modules/tasks/`**: Task CRUD, assignment, status tracking, statistics

#### **`src/interfaces/`** - Shared Type Definitions
- **`user.interface.ts`**: User types, UserWithoutPassword
- **`task.interface.ts`**: Task types, TaskWithUser, AssignedUser
- **`graphql.interface.ts`**: GraphQL context and JWT payload types
- **`error.interface.ts`**: AppError interface
- **`logger.interface.ts`**: Logging types
- **`index.ts`**: Central export point for all interfaces

#### **`src/utils/`** - Utility Functions
- **`logger.ts`**: Custom logger with log levels (info, warn, error, debug)
- **`response.ts`**: Empty file (likely intended for standardized responses)

#### **`src/types/`** - TypeScript Declaration Files
- **`express.d.ts`**: Express Request extension for user property

#### **`src/seeders/`** - Database Seeders
- **`seed-admin.ts`**: Creates default admin user (ashraf.diab22.ad@gmail.com)

#### **`src/graphql/`** - GraphQL Configuration
- **`index.ts`**: GraphQL schema composition
- **`resolvers.ts`**: Combined resolvers
- **`schema.ts`**: Combined type definitions
- **`generated/schema.graphql`**: Auto-generated schema file

#### **`src/` Root Files**
- **`app.ts`**: Express application setup (middleware, routes)
- **`server.ts`**: Server initialization, Apollo integration, startup
- **`test-login.ts`**: Manual testing script for authentication

---

## 3. Technologies Used (with Justifications)

### Core Technologies

#### **Node.js v24+**
- **Why**: JavaScript runtime for building scalable network applications
- **Benefits**: Non-blocking I/O, vast ecosystem, excellent async support
- **Use Case**: Backend API server for handling concurrent requests

#### **TypeScript 5.9+**
- **Why**: Adds static typing to JavaScript
- **Benefits**: 
  - Type safety catches errors at compile time
  - Enhanced IDE support (IntelliSense, refactoring)
  - Better code maintainability in large codebases
  - Self-documenting code through types
- **Configuration**: Strict mode enabled, ES2022 target, CommonJS modules
- **Use Case**: Primary development language for all source code

#### **Express.js v5.1**
- **Why**: Minimalist web framework for Node.js
- **Benefits**: 
  - Lightweight and unopinionated
  - Mature ecosystem with extensive middleware
  - Fine-grained control over request/response cycle
  - Battle-tested in production environments
- **Use Case**: RESTful API endpoints (`/api/auth`, `/api/users`, `/api/tasks`)

### Database Layer

#### **SQLite3 v5.1 + sqlite v5.1**
- **Why**: Lightweight embedded SQL database
- **Benefits**:
  - Zero-configuration setup (perfect for hiring task scope)
  - ACID compliance
  - Single-file database (easy deployment)
  - SQL support with relational modeling
  - No separate database server required
- **Trade-offs**: 
  - Limited concurrency (but sufficient for task requirements)
  - In production, would migrate to PostgreSQL or MySQL
- **Use Case**: Data persistence for users and tasks

#### **No ORM Used (Raw SQL with sqlite wrapper)**
- **Why**: Direct database control
- **Benefits**:
  - Performance optimization (no ORM overhead)
  - Explicit SQL queries (clear data access patterns)
  - No "magic" behind the scenes
  - Demonstrates SQL proficiency
- **Pattern**: Data Access Layer (DAL) pattern abstracts database operations

### GraphQL Layer

#### **Apollo Server Express v3.13**
- **Why**: GraphQL server implementation integrated with Express
- **Benefits**:
  - Flexible data fetching (clients request only needed fields)
  - Strongly-typed schema
  - Single endpoint for all operations
  - Built-in GraphQL Playground for testing
  - Context injection for authentication
- **Use Case**: Alternative API interface to REST at `/graphql`

#### **GraphQL v16.11**
- **Why**: Query language for APIs
- **Benefits**:
  - Client-driven data requirements
  - No over-fetching or under-fetching
  - Schema-first development
  - Type safety at API boundary
- **Use Case**: Modern API alternative for frontend flexibility

#### **@graphql-codegen/cli v6.0**
- **Why**: Generates GraphQL schema files from TypeScript type definitions
- **Benefits**:
  - Type-safe GraphQL development
  - Schema consistency between TypeScript and GraphQL
  - Automated schema generation from code
- **Configuration**: `codegen.yml` generates `schema.graphql` from `*.schema.ts` files

### Security & Authentication

#### **bcryptjs v3.0**
- **Why**: Password hashing library (pure JavaScript implementation)
- **Benefits**:
  - Adaptive hashing (cost factor of 10)
  - Salting built-in
  - Resistant to rainbow table attacks
  - No native dependencies (works across platforms)
- **Use Case**: Hash passwords before storing, validate on login

#### **jsonwebtoken v9.0**
- **Why**: JWT token generation and verification
- **Benefits**:
  - Stateless authentication (no session storage)
  - Contains user identity and role
  - 7-day expiration (configurable)
  - Signed with secret key
- **Use Case**: Authenticate API requests (REST & GraphQL)

#### **cors v2.8**
- **Why**: Cross-Origin Resource Sharing middleware
- **Benefits**: Allows frontend apps on different domains to access API
- **Use Case**: Enable browser-based clients to call API

### Validation & Type Safety

#### **Zod v4.1**
- **Why**: TypeScript-first schema validation library
- **Benefits**:
  - Runtime validation + type inference
  - Composable schemas
  - Detailed error messages
  - Schema-to-TypeScript type derivation
  - Better DX than alternatives (Joi, Yup)
- **Use Case**: Validate request bodies for REST endpoints

### Development Tools

#### **ts-node-dev v2.0**
- **Why**: TypeScript execution with hot-reload
- **Benefits**:
  - Fast development iteration
  - Watches file changes and restarts server
  - Transpile-only mode for speed
- **Use Case**: Development server (`npm run dev`)

#### **reflect-metadata v0.2**
- **Why**: Polyfill for metadata reflection API
- **Benefits**: Required for decorator-based features (future extensibility)
- **Use Case**: Enables advanced TypeScript decorators

#### **uuid v13.0**
- **Why**: Generates RFC-compliant UUIDs
- **Benefits**:
  - Globally unique identifiers
  - Version 4 (random) UUIDs
  - Avoids auto-increment ID security issues
- **Use Case**: Primary keys for users and tasks

#### **dotenv v17.2**
- **Why**: Loads environment variables from `.env` file
- **Benefits**:
  - Separates config from code
  - Different configs per environment
  - Secure secret management
- **Use Case**: Load JWT_SECRET, DATABASE_URL, PORT

---

## 4. Packages / Libraries (Deep Dive)

### Production Dependencies

| Package | Version | Purpose | Why Chosen |
|---------|---------|---------|------------|
| **express** | 5.1.0 | HTTP server framework | Industry standard, minimal overhead, flexible middleware system |
| **apollo-server-express** | 3.13.0 | GraphQL server | Seamless Express integration, built-in Playground, robust context handling |
| **graphql** | 16.11.0 | GraphQL implementation | Required peer dependency for Apollo, query language standard |
| **sqlite3** | 5.1.7 | SQLite driver | Embedded database, zero-config, ACID compliance |
| **sqlite** | 5.1.1 | Promise-based SQLite wrapper | Async/await API over sqlite3, cleaner code |
| **bcryptjs** | 3.0.2 | Password hashing | Pure JS (no native deps), adaptive hashing, industry-standard security |
| **jsonwebtoken** | 9.0.2 | JWT handling | Stateless auth, signed tokens, customizable expiration |
| **zod** | 4.1.12 | Schema validation | Type-safe validation, excellent TypeScript integration, superior DX |
| **uuid** | 13.0.0 | UUID generation | RFC 4122 compliant, cryptographically strong randomness |
| **cors** | 2.8.5 | CORS middleware | Enable cross-origin requests, configurable security policies |
| **dotenv** | 17.2.3 | Environment config | 12-factor app compliance, secret management |
| **reflect-metadata** | 0.2.2 | Metadata API polyfill | Enables decorator metadata (future-proofing) |

### Development Dependencies

| Package | Version | Purpose | Why Chosen |
|---------|---------|---------|------------|
| **typescript** | 5.9.3 | TypeScript compiler | Latest stable version, cutting-edge features |
| **ts-node-dev** | 2.0.0 | TS dev server | Hot-reload, fast transpilation, excellent DX |
| **@types/node** | 24.9.2 | Node.js types | Essential for Node API type safety |
| **@types/express** | 5.0.5 | Express types | Type-safe Express development |
| **@types/cors** | 2.8.19 | CORS types | Type definitions for cors middleware |
| **@types/bcryptjs** | 2.4.6 | bcryptjs types | Type-safe password hashing |
| **@types/jsonwebtoken** | 9.0.10 | JWT types | Type-safe token operations |
| **@types/uuid** | 10.0.0 | UUID types | Type-safe UUID generation |
| **@graphql-codegen/cli** | 6.0.1 | GraphQL code generator | Automated schema generation from TypeScript |

---

## 5. Database Design

### Schema Structure

#### **Users Table**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID v4
  name TEXT NOT NULL,               -- Full name (2-100 chars)
  email TEXT UNIQUE NOT NULL,       -- Unique email address
  passwordHash TEXT NOT NULL,       -- Bcrypt hash (cost factor 10)
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  position TEXT,                    -- Job title (optional)
  jobDescription TEXT,              -- Role description (optional)
  createdAt TEXT NOT NULL,          -- ISO 8601 timestamp
  updatedAt TEXT NOT NULL           -- ISO 8601 timestamp
);
```

**Constraints & Validation:**
- `id`: UUID v4 format
- `email`: Must be unique, validated by Zod email schema
- `passwordHash`: bcrypt hash with salt (never exposed in API responses)
- `role`: Enum-like constraint ('admin' | 'user')
- `name`: 2-100 characters
- `position`: 2-100 characters (optional)
- `jobDescription`: Max 500 characters (optional)

#### **Tasks Table**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- UUID v4
  title TEXT NOT NULL,              -- Task title (3-200 chars)
  description TEXT,                 -- Task details (max 1000 chars, optional)
  status TEXT NOT NULL,             -- 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  assignedTo TEXT,                  -- Foreign key to users.id (optional)
  createdAt TEXT NOT NULL,          -- ISO 8601 timestamp
  updatedAt TEXT NOT NULL,          -- ISO 8601 timestamp
  FOREIGN KEY (assignedTo) REFERENCES users(id)
);
```

**Constraints & Validation:**
- `id`: UUID v4 format
- `title`: 3-200 characters
- `description`: Max 1000 characters (nullable)
- `status`: Enum ('PENDING', 'IN_PROGRESS', 'COMPLETED')
- `assignedTo`: FK to users.id (nullable for unassigned tasks)

### Relationships

```
┌─────────────┐         1        ┌─────────────┐
│    users    │◄─────────────────│    tasks    │
│             │    assignedTo    │             │
│  id (PK)    │                  │  id (PK)    │
│  name       │                  │  title      │
│  email      │                  │  status     │
│  role       │                  │ assignedTo  │
└─────────────┘                  └─────────────┘
      1                                 *
    (user)                           (tasks)
```

**Relationship Type**: One-to-Many (1:N)
- One user can have multiple tasks assigned
- One task can be assigned to at most one user
- Tasks can exist without assignment (assignedTo = NULL)

**Data Integrity:**
- Foreign key ensures `assignedTo` references valid user ID
- ON DELETE behavior: NOT specified (would need to be defined for production)
  - **Recommendation**: ON DELETE SET NULL (unassign tasks when user deleted)

### Indexing Strategy

**Current State**: No explicit indexes defined (SQLite auto-indexes PRIMARY KEY and UNIQUE constraints)

**Automatic Indexes:**
1. `users.id` (PRIMARY KEY) - B-tree index
2. `users.email` (UNIQUE) - B-tree index
3. `tasks.id` (PRIMARY KEY) - B-tree index

**Recommended Additional Indexes (for production):**
```sql
-- Speed up task queries filtered by assignee
CREATE INDEX idx_tasks_assignedTo ON tasks(assignedTo);

-- Speed up task status queries (for admin dashboard)
CREATE INDEX idx_tasks_status ON tasks(status);

-- Composite index for user tasks by status
CREATE INDEX idx_tasks_assignedTo_status ON tasks(assignedTo, status);

-- Speed up task sorting by creation date
CREATE INDEX idx_tasks_createdAt ON tasks(createdAt DESC);

-- Speed up user role-based queries
CREATE INDEX idx_users_role ON users(role);
```

**Index Selection Rationale:**
- **`assignedTo`**: Most common filter (users query "my tasks")
- **`status`**: Dashboard aggregations, task filtering
- **`createdAt`**: Default sort order (DESC)
- **Composite index**: Optimize common query patterns

### Migrations / Seeders

**Current Implementation:**
- **No migration framework** (manual SQL in `database.ts`)
- **Table creation**: `IF NOT EXISTS` pattern ensures idempotency
- **Schema updates**: Require manual SQL modification

**Seeder: `seed-admin.ts`**
```typescript
Purpose: Create default admin user for initial system access
Credentials:
  - Email: ashraf.diab22.ad@gmail.com
  - Password: P@ssw0rd (hashed with bcrypt)
  - Role: admin
  - Name: Ashraf Diab

Safety: Checks if admin exists before creating (prevents duplicates)
```

**Production Recommendations:**
- Implement migration framework (e.g., `node-pg-migrate`, `typeorm migrations`)
- Version-controlled schema changes
- Rollback capabilities
- Separate dev/staging/prod seeds

---

## 6. Architecture & Design

### Layered Architecture (4-Tier)

```
┌───────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                    │
│  • Controllers (REST request handlers)                 │
│  • Resolvers (GraphQL query/mutation handlers)         │
│  • Routes (Express routing)                            │
│  • Middleware (auth, error, validation)                │
└───────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                  │
│  • Services (domain logic, orchestration)              │
│  • Authorization rules (RBAC)                          │
│  • Business validations                                │
│  • Error handling (domain errors)                      │
└───────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                     │
│  • Models (DAL objects: userDAL, taskDAL)              │
│  • Database queries (raw SQL)                          │
│  • Data transformations                                │
└───────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────┐
│                    DATABASE LAYER                      │
│  • SQLite database                                     │
│  • Connection management                               │
│  • Transaction handling                                │
└───────────────────────────────────────────────────────┘
```

### SOLID Principles Implementation

#### **1. Single Responsibility Principle (SRP)**
Each class/module has ONE reason to change:

```typescript
// ✅ GOOD: AuthService only handles authentication logic
class AuthService {
  static async register() { /* ... */ }
  static async login() { /* ... */ }
  static async getMe() { /* ... */ }
}

// ✅ GOOD: AuthController only handles HTTP request/response
class AuthController {
  static async register(req, res, next) { /* ... */ }
  static async login(req, res, next) { /* ... */ }
}

// ✅ GOOD: userDAL only handles database operations
const userDAL = {
  async create() { /* SQL INSERT */ },
  async findById() { /* SQL SELECT */ },
  async update() { /* SQL UPDATE */ },
  async delete() { /* SQL DELETE */ }
}
```

**Evidence in Codebase:**
- Controllers: HTTP concerns only
- Services: Business logic only
- DAL: Database operations only
- Middleware: Cross-cutting concerns (auth, errors)

#### **2. Open/Closed Principle (OCP)**
Open for extension, closed for modification:

```typescript
// ✅ Custom error classes extend base Error (OCP)
export class NotFoundError extends Error { /* ... */ }
export class ConflictError extends Error { /* ... */ }
export class ForbiddenError extends Error { /* ... */ }

// ✅ Middleware pipeline is extensible
app.use(cors());
app.use(jsonMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use(errorHandler); // Centralized error handling
```

**Future Extensions (without modifying core):**
- Add new modules (projects, comments, attachments)
- Add new authentication strategies (OAuth, SAML)
- Add new middleware (rate limiting, caching)

#### **3. Liskov Substitution Principle (LSP)**
Subtypes must be substitutable for base types:

```typescript
// ✅ All custom errors are substitutable for Error
function handleError(error: Error) {
  console.error(error.message);
}

// Works with all error types
handleError(new NotFoundError("User not found"));
handleError(new ConflictError("Email taken"));
handleError(new Error("Generic error"));
```

#### **4. Interface Segregation Principle (ISP)**
Clients shouldn't depend on interfaces they don't use:

```typescript
// ✅ Minimal, focused interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  // ... only user-related fields
}

export interface Task {
  id: string;
  title: string;
  status: string;
  // ... only task-related fields
}

// ✅ GraphQL context only contains what resolvers need
export interface GraphQLContext {
  user?: { id: string; role: string };
}
```

**No Fat Interfaces**: Each interface is cohesive and minimal.

#### **5. Dependency Inversion Principle (DIP)**
Depend on abstractions, not concretions:

```typescript
// ✅ Services depend on DAL abstraction (not direct DB access)
class TaskService {
  static async createTask(data) {
    // Depends on taskDAL abstraction, not database directly
    return await taskDAL.create(data.title, data.description);
  }
}

// ✅ Database abstraction through getDB() function
export const getDB = (): Database => {
  if (!db) throw new Error("Database not initialized");
  return db;
}
```

**Benefits:**
- Easy to swap database (SQLite → PostgreSQL)
- Easy to mock for testing
- Reduced coupling

### Clean Architecture Practices

#### **Dependency Rule**
Dependencies point inward (toward business logic):
```
Controllers/Resolvers → Services → DAL → Database
(outer layers)      →  (inner layers)
```

#### **Domain-Centric Organization**
Code is organized by feature (domain), not technical layer:
```
modules/
  auth/       (authentication domain)
  users/      (user management domain)
  tasks/      (task management domain)
```

#### **Separation of Concerns**
- **Controllers**: Transform HTTP → Service calls
- **Resolvers**: Transform GraphQL → Service calls
- **Services**: Business rules, authorization, orchestration
- **DAL**: Data persistence, queries

### Design Patterns Used

#### **1. Data Access Layer (DAL) Pattern**
```typescript
// Encapsulates all database operations
export const userDAL = {
  async create() { /* INSERT */ },
  async findById() { /* SELECT */ },
  async findByEmail() { /* SELECT */ },
  async update() { /* UPDATE */ },
  async delete() { /* DELETE */ }
}
```
**Benefits**: Single source of truth for DB operations, easy to test, swap implementations.

#### **2. Service Layer Pattern**
```typescript
// Business logic orchestration
export class TaskService {
  static async createTask() { /* validate, authorize, create */ }
  static async updateTask() { /* validate, authorize, update */ }
}
```
**Benefits**: Reusable business logic, shared between REST and GraphQL.

#### **3. Factory Pattern**
```typescript
// Database factory
export const connectDB = async () => {
  if (db) return db; // Singleton behavior
  db = await open({ /* config */ });
  await db.exec(/* create tables */);
  return db;
};
```
**Benefits**: Controlled object creation, lazy initialization.

#### **4. Singleton Pattern**
```typescript
// Database singleton
let db: Database | null = null;

export const getDB = (): Database => {
  if (!db) throw new Error("Not initialized");
  return db;
};
```
**Benefits**: Single database connection shared across app.

#### **5. Middleware Pattern**
```typescript
// Express middleware chain
app.use(cors());
app.use(jsonParser);
app.use(authMiddleware);
app.use(errorHandler);
```
**Benefits**: Cross-cutting concerns, composable request processing.

#### **6. Dependency Injection (DI)**
```typescript
// Context injection in GraphQL
context: ({ req }) => {
  const user = extractUserFromToken(req.headers.authorization);
  return { user };
}

// Used in resolvers
tasks: async (_parent, _args, context: GraphQLContext) => {
  if (!context.user) throw new Error("Not authenticated");
  return await TaskService.getAllTasks(context.user.role, context.user.id);
}
```
**Benefits**: Testability, flexibility, loose coupling.

#### **7. Strategy Pattern**
```typescript
// Authorization strategies based on role
static async getAllTasks(role: string, userId: string) {
  if (role === "admin") {
    return await taskDAL.findAllWithUsers(); // Admin strategy
  } else {
    return await taskDAL.findByAssignedToWithUser(userId); // User strategy
  }
}
```
**Benefits**: Polymorphic behavior based on role.

---

## 7. Performance

### Performance Optimizations

#### **1. Database Query Optimization**

**LEFT JOIN for Related Data (N+1 Prevention)**
```typescript
// ✅ GOOD: Single query fetches task + user
async findByIdWithUser(id: string): Promise<TaskWithUser | null> {
  return await db.get(`
    SELECT 
      t.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      /* ... more user fields */
    FROM tasks t
    LEFT JOIN users u ON t.assignedTo = u.id
    WHERE t.id = ?
  `, id);
}

// ❌ BAD: N+1 query problem (avoided)
// async findById() { /* get task */ }
// async getUser(userId) { /* separate query */ }
```

**Benefits**: Eliminates N+1 queries, reduces database round-trips.

#### **2. Async/Await Flow**

**Non-Blocking I/O**
```typescript
// All database operations are async
const users = await userDAL.findAll();
const tasks = await taskDAL.findAllWithUsers();

// Parallel operations when independent
const [user, stats] = await Promise.all([
  userDAL.findById(userId),
  taskDAL.getTaskStats(role, userId)
]);
```

**Benefits**: 
- Non-blocking event loop
- Handles concurrent requests efficiently
- Leverages Node.js strengths

#### **3. Singleton Database Connection**
```typescript
let db: Database | null = null;

export const connectDB = async () => {
  if (db) return db; // Reuse existing connection
  db = await open({ /* ... */ });
  return db;
};
```
**Benefits**: 
- Avoids connection pool overhead (SQLite is single-connection)
- Fast connection reuse

#### **4. Efficient Data Transformation**
```typescript
// Transform at database query level (not in JavaScript)
SELECT 
  SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
FROM tasks
```
**Benefits**: Aggregation in database (faster than JS loops).

### Caching Strategy

**Current State**: No caching implemented

**Production Recommendations**:
```typescript
// 1. In-Memory Cache (node-cache)
const cache = new NodeCache({ stdTTL: 600 }); // 10 min TTL

// 2. Redis for distributed caching
// Cache frequently accessed data:
// - User profiles
// - Task statistics
// - User permissions

// 3. HTTP caching headers
res.setHeader('Cache-Control', 'public, max-age=300');
```

### Rate Limiting

**Current State**: No rate limiting

**Production Recommendations**:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

### Memory Usage Optimization

**1. Pagination (Not Implemented)**
```typescript
// Current: Returns all tasks
async findAll(): Promise<Task[]> {
  return await db.all("SELECT * FROM tasks");
}

// Production: Add pagination
async findAll(page = 1, limit = 20): Promise<Task[]> {
  const offset = (page - 1) * limit;
  return await db.all(
    "SELECT * FROM tasks LIMIT ? OFFSET ?",
    [limit, offset]
  );
}
```

**2. Streaming Large Results**
For large datasets, use streams instead of loading all into memory.

**3. Avoid Password Hash Exposure**
```typescript
// ✅ GOOD: Password stripped at service layer
const { passwordHash, ...userWithoutPassword } = user;
return userWithoutPassword;
```

### Performance Monitoring

**Implemented**: Custom logger with timestamps
```typescript
logger.info('GraphQL request authenticated', { userId, role });
logger.error('Failed to start server:', error);
```

**Production Needs**:
- APM tools (New Relic, Datadog)
- Request duration tracking
- Database query profiling
- Memory leak detection

---

## 8. Security

### Authentication Approach

#### **JWT-Based Stateless Authentication**
```typescript
// Token generation (login/register)
const token = jwt.sign(
  { id: user.id, role: user.role },
  config.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token verification (middleware)
const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
req.user = { id: decoded.id, role: decoded.role };
```

**Security Properties**:
- **Signed**: Tamper-proof (HMAC signature)
- **Stateless**: No server-side session storage
- **Expiration**: 7-day TTL (reduces long-term token compromise risk)
- **Payload**: Minimal claims (id, role) - no sensitive data

**Token Format**: `Bearer <token>` in Authorization header

### Authorization (Role-Based Access Control)

#### **Two-Tier Authorization**

**1. Middleware-Level (Route Protection)**
```typescript
// Authentication middleware: Verify JWT
export const authMiddleware = (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
};

// Admin middleware: Check role
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Route application
router.post("/users", authMiddleware, adminMiddleware, createUser);
```

**2. Service-Level (Business Logic)**
```typescript
static async getAllTasks(role: string, userId: string) {
  if (role === "admin") {
    return await taskDAL.findAllWithUsers(); // See all tasks
  } else {
    return await taskDAL.findByAssignedToWithUser(userId); // Only my tasks
  }
}
```

**Authorization Matrix**:

| Action | Admin | User |
|--------|-------|------|
| Create User | ✅ | ❌ |
| Delete User | ✅ | ❌ |
| View All Tasks | ✅ | ❌ (only assigned) |
| Create Task | ✅ | ✅ |
| Update Own Task | ✅ | ✅ |
| Update Others' Task | ✅ | ❌ |
| Assign Task | ✅ | ❌ |

### Password Handling

#### **Bcrypt Hashing**
```typescript
// Registration: Hash password
const passwordHash = await bcrypt.hash(password, 10); // Cost factor 10

// Login: Compare hash
const valid = await bcrypt.compare(password, user.passwordHash);
```

**Security Properties**:
- **Salting**: Random salt per password (prevents rainbow tables)
- **Cost Factor**: 10 rounds (2^10 = 1024 iterations)
- **Adaptive**: Can increase cost factor as hardware improves
- **One-Way**: Cannot reverse hash to plaintext

**Password Complexity Requirements (Zod Validation)**:
```typescript
password: z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain digit")
  .regex(/[@$!%*?&#]/, "Must contain special character")
```

**Password Storage**: Never stored in plaintext, only `passwordHash` in database

**Password Exposure Prevention**:
```typescript
// ✅ GOOD: Strip password before returning
const { passwordHash, ...userWithoutPassword } = user;
return userWithoutPassword;

// ❌ Never include passwordHash in API responses
```

### Environment Protection

#### **.env File Security**
```typescript
// Load environment variables
dotenv.config();

export const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'changeme', // ⚠️ Default for dev only
  DATABASE_URL: process.env.DATABASE_URL || './task-management-system.db',
  PORT: process.env.PORT || 4000
};
```

**Best Practices**:
- `.env` in `.gitignore` (not committed to version control)
- Different secrets per environment (dev, staging, prod)
- Use secret management in production (AWS Secrets Manager, Vault)

**Security Improvements Needed**:
```typescript
// ⚠️ Current: Logs JWT_SECRET prefix (security risk)
console.log('JWT_SECRET:', config.JWT_SECRET.substring(0, 20));

// ✅ Better: Validate presence, never log
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set');
}
```

### Validation and Sanitization

#### **Input Validation (Zod)**
All user inputs are validated before processing:

```typescript
// Registration validation
export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/* complexity rules */),
  position: z.string().min(2).max(100).optional(),
  jobDescription: z.string().max(500).optional(),
});

// Usage in controller
const validated = RegisterSchema.parse(req.body); // Throws on invalid input
```

**Protection Against**:
- Invalid email formats
- Weak passwords
- SQL injection (parameterized queries)
- XSS (no HTML rendering in API)
- Type coercion attacks

#### **Parameterized Queries (SQL Injection Prevention)**
```typescript
// ✅ GOOD: Parameterized query
await db.run(
  "INSERT INTO users (id, name, email, passwordHash) VALUES (?, ?, ?, ?)",
  [id, name, email, passwordHash]
);

// ❌ BAD: String concatenation (NEVER DO THIS)
// await db.run(`INSERT INTO users VALUES ('${id}', '${name}')`);
```

**SQLite driver automatically escapes parameters**, preventing SQL injection.

### Additional Security Measures

#### **CORS Configuration**
```typescript
app.use(cors()); // ⚠️ Currently allows all origins

// Production: Restrict origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```

#### **GraphQL Specific Security**
```typescript
// Context authentication for GraphQL
function getAuthContext({ req }) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return {};
  
  try {
    const user = jwt.verify(token, config.JWT_SECRET);
    return { user };
  } catch {
    return {}; // Invalid token = no user context
  }
}
```

### Security Vulnerabilities & Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| **SQL Injection** | ✅ Parameterized queries |
| **Weak Passwords** | ✅ Complexity validation (Zod) |
| **Password Storage** | ✅ Bcrypt hashing with salt |
| **Session Hijacking** | ✅ JWT expiration (7 days) |
| **CSRF** | ✅ Stateless JWT (no cookies) |
| **XSS** | ✅ API-only (no HTML rendering) |
| **Brute Force** | ⚠️ No rate limiting (needs implementation) |
| **Token Leakage** | ⚠️ HTTPS enforcement needed in prod |
| **Mass Assignment** | ✅ Explicit field validation (Zod) |
| **Insecure Dependencies** | ⚠️ Regular `npm audit` needed |

---

## 9. Error Handling

### Global Error Handling Strategy

#### **Centralized Error Middleware**
```typescript
// error.middleware.ts
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
```

**Features**:
- Catches all unhandled errors in Express
- Consistent error response format
- Stack traces in development only
- Respects HTTP status codes from custom errors

**Application**:
```typescript
// Applied as last middleware in app.ts
app.use(errorHandler);
```

### Custom Exceptions

#### **Domain-Specific Error Classes**

```typescript
// 404 Not Found
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// 409 Conflict
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

// 401 Unauthorized
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

// 403 Forbidden
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
```

**Usage in Services**:
```typescript
static async getById(id: string): Promise<User> {
  const user = await userDAL.findById(id);
  if (!user) {
    throw new NotFoundError("User not found"); // 404
  }
  return user;
}

static async create(data): Promise<User> {
  if (await userDAL.isEmailTaken(data.email)) {
    throw new ConflictError("Email already taken"); // 409
  }
  // ...
}
```

### Error Handling Layers

#### **1. Controller Layer (REST)**
```typescript
static async createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = CreateUserSchema.parse(req.body);
    const user = await UserService.create(validated);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation errors: 400 Bad Request
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues
      });
    } else {
      // Pass to global error handler
      next(error);
    }
  }
}
```

**Error Types Handled**:
- **Validation Errors (Zod)**: Immediate 400 response with field-level errors
- **Service Errors**: Passed to `next()` → global error handler
- **Unexpected Errors**: Caught by global error handler

#### **2. Resolver Layer (GraphQL)**
```typescript
createTask: async (_parent, { input }, context) => {
  if (!context.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" }
    });
  }

  try {
    return await TaskService.createTask(input);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new GraphQLError(error.message, {
        extensions: { code: "NOT_FOUND" }
      });
    }
    throw new GraphQLError("Failed to create task", {
      extensions: { code: "INTERNAL_SERVER_ERROR" }
    });
  }
}
```

**GraphQL Error Handling**:
- Custom `GraphQLError` with extension codes
- Standardized error codes (UNAUTHENTICATED, NOT_FOUND, FORBIDDEN)
- Apollo Server formats errors automatically

#### **3. Service Layer**
```typescript
static async updateTask(taskId, data, role, userId) {
  const existingTask = await taskDAL.findById(taskId);
  
  if (!existingTask) {
    throw new NotFoundError("Task not found");
  }

  if (role !== "admin" && existingTask.assignedTo !== userId) {
    throw new ForbiddenError("You do not have permission");
  }

  // Business logic...
}
```

**Service Layer Responsibilities**:
- Domain validation (existence checks)
- Authorization checks
- Throw meaningful domain errors

#### **4. Middleware Layer**
```typescript
export const authMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
```

**Middleware Error Handling**:
- Catches authentication failures
- Returns immediate 401 response
- Prevents unauthenticated requests from reaching controllers

### Error Response Formats

#### **REST API Error Format**
```json
{
  "success": false,
  "message": "User not found",
  "stack": "Error: User not found\n    at ..." // Dev only
}

// Validation errors
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "code": "too_small",
      "minimum": 8,
      "path": ["password"],
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

#### **GraphQL Error Format**
```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": {
        "code": "UNAUTHENTICATED"
      },
      "path": ["tasks"],
      "locations": [{ "line": 2, "column": 3 }]
    }
  ],
  "data": null
}
```

### Logging Strategy

```typescript
// Logger implementation (utils/logger.ts)
class Logger {
  info(message: string, data?: LogData): void {
    console.log(`[${timestamp}] [INFO] ${message}`, data);
  }

  error(message: string, data?: unknown): void {
    console.error(`[${timestamp}] [ERROR] ${message}`, data);
  }

  warn(message: string, data?: LogData): void {
    console.log(`[${timestamp}] [WARN] ${message}`, data);
  }
}

// Usage
logger.info('User registered:', user.email);
logger.error('Failed to start server:', error);
logger.warn('Invalid JWT token in GraphQL request');
```

**Production Logging Needs**:
- Structured logging (JSON format)
- Log aggregation (ELK, Datadog, Splunk)
- Error tracking (Sentry, Rollbar)
- Request correlation IDs

---

## 10. Testing

### Current State
**No tests implemented** (hiring task scope focused on architecture)

### Recommended Testing Strategy

#### **1. Unit Testing**

**Framework**: Jest + ts-jest

```typescript
// Example: auth.service.test.ts
describe('AuthService', () => {
  describe('register', () => {
    it('should hash password before storing', async () => {
      const result = await AuthService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'P@ssw0rd123'
      });

      expect(result.user.passwordHash).toBeUndefined();
      // Verify bcrypt.hash was called
    });

    it('should throw ConflictError if email exists', async () => {
      // Mock userDAL.isEmailTaken to return true
      await expect(
        AuthService.register({ /* ... */ })
      ).rejects.toThrow(ConflictError);
    });
  });
});
```

**Test Coverage Targets**:
- Services: 90%+ (core business logic)
- DAL: 80%+ (database operations)
- Middleware: 85%+
- Utilities: 90%+

#### **2. Integration Testing**

**Framework**: Jest + supertest (for HTTP testing)

```typescript
// Example: auth.routes.test.ts
describe('POST /api/auth/register', () => {
  it('should register new user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'P@ssw0rd123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it('should return 400 for weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});
```

#### **3. End-to-End (E2E) Testing**

**Framework**: Jest + test database

```typescript
// Example: task-assignment.e2e.test.ts
describe('Task Assignment Flow', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    // Setup test database
    // Register admin and user
    // Get authentication tokens
  });

  it('should allow admin to assign task to user', async () => {
    // 1. Admin creates task
    const createResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Task' });

    taskId = createResponse.body.data.id;

    // 2. Admin assigns to user
    const assignResponse = await request(app)
      .post(`/api/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: userId });

    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.data.assignedTo).toBe(userId);

    // 3. User can now see the task
    const userTasksResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    const userTasks = userTasksResponse.body.data;
    expect(userTasks.find(t => t.id === taskId)).toBeDefined();
  });
});
```

#### **4. GraphQL Testing**

```typescript
// Example: graphql.test.ts
describe('GraphQL API', () => {
  it('should query authenticated user tasks', async () => {
    const query = `
      query {
        tasks {
          id
          title
          status
          assignedToUser {
            name
          }
        }
      }
    `;

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query });

    expect(response.body.data.tasks).toBeDefined();
  });
});
```

### Testing Tools Recommended

| Tool | Purpose |
|------|---------|
| **Jest** | Test runner, assertions, mocking |
| **ts-jest** | TypeScript support for Jest |
| **supertest** | HTTP integration testing |
| **@types/jest** | Jest type definitions |
| **faker-js** | Generate test data |
| **jest-mock-extended** | Advanced mocking |

### Test Database Strategy

```typescript
// test/setup.ts
beforeAll(async () => {
  // Use in-memory SQLite for tests
  process.env.DATABASE_URL = ':memory:';
  await connectDB();
});

afterEach(async () => {
  // Clear database between tests
  await db.exec('DELETE FROM tasks');
  await db.exec('DELETE FROM users');
});

afterAll(async () => {
  await db.close();
});
```

### Mocking Strategy

```typescript
// Mock external dependencies
jest.mock('../config/database', () => ({
  getDB: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn().mockReturnValue({ id: '123', role: 'user' })
}));
```

---

## Conclusion

This documentation provides a comprehensive overview of the Team Tasks Backend project, covering architecture, design patterns, security, performance, and recommended improvements for production deployment. The codebase demonstrates senior-level software engineering practices with clear separation of concerns, SOLID principles, and clean architecture patterns.

