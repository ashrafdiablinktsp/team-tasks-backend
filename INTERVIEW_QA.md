# Interview Questions & Answers - Team Tasks Backend

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Folder Structure & Organization](#folder-structure--organization)
3. [TypeScript Usage](#typescript-usage)
4. [Node.js Internals](#nodejs-internals)
5. [Express.js Lifecycle](#expressjs-lifecycle)
6. [Middleware Flow](#middleware-flow)
7. [Database Performance](#database-performance)
8. [Transactions](#transactions)
9. [Indexing](#indexing)
10. [ORM vs Raw Queries](#orm-vs-raw-queries)
11. [SOLID Principles](#solid-principles)
12. [Design Patterns](#design-patterns)
13. [Dependency Injection](#dependency-injection)
14. [Error Handling](#error-handling)
15. [Security](#security)
16. [DevOps & Deployment](#devops--deployment)
17. [Scaling Strategy](#scaling-strategy)
18. [Code Quality](#code-quality)
19. [Refactoring Decisions](#refactoring-decisions)
20. [Trade-offs](#trade-offs)

---

## Project Architecture

### Q1: Walk me through the high-level architecture of this system. Why did you choose this structure?

**Answer:**

The system implements a **4-tier layered architecture** with clear separation of concerns:

1. **Presentation Layer** (Controllers/Resolvers)
2. **Business Logic Layer** (Services)
3. **Data Access Layer** (Models/DAL)
4. **Database Layer** (SQLite)

**Why this structure?**

**Separation of Concerns**: Each layer has a single responsibility. Controllers handle HTTP, services contain business logic, DAL manages database operations. This makes the code easier to understand, test, and modify.

**Testability**: Each layer can be tested independently. I can mock the DAL when testing services, or mock services when testing controllers.

**Flexibility**: The architecture supports both REST and GraphQL APIs without code duplication. Both call the same service layer, demonstrating the value of layered design.

**Maintainability**: When requirements change (e.g., switching from SQLite to PostgreSQL), I only modify the DAL layer. The business logic remains untouched.

**Scalability**: The architecture naturally supports horizontal scaling. Multiple server instances can share the same database. The stateless JWT authentication means no session affinity is required.

**Technology choices aligned with architecture**:
- Express for REST (lightweight, unopinionated)
- Apollo Server for GraphQL (seamless Express integration)
- No ORM (direct control over queries, better performance)
- Zod for validation (type-safe, composable)

This architecture follows **Clean Architecture** principles where dependencies point inward toward business logic, not outward toward frameworks or databases.

---

### Q2: This is a monolithic architecture. When would you consider breaking it into microservices?

**Answer:**

I would consider microservices when we encounter **specific pain points**, not prematurely. Monoliths have significant advantages for small-to-medium teams:

**Keep as Monolith When**:
- Team size < 20 developers
- Feature velocity is high (monoliths enable faster iteration)
- Deployment complexity would slow us down
- Transaction boundaries align with modules
- Shared database simplifies queries (tasks need user data)

**Move to Microservices When**:

1. **Independent Scaling Needs**: If the task management module needs 10x more resources than user management, they should be separate services.

2. **Team Organization**: When we have 3+ teams working independently, and merge conflicts/deployment coordination become bottlenecks.

3. **Technology Diversity**: If we need real-time task updates (WebSockets/SSE) but user management remains CRUD, separating them allows different tech stacks.

4. **Data Ownership**: When we want different teams to own their databases completely (e.g., an analytics team needs a data warehouse, not our transactional SQLite).

5. **Release Cadence Mismatch**: If auth changes rarely but tasks change daily, deploying them together slows down task deployments.

**Migration Strategy**:
- Start with **modular monolith** (we already have modules)
- Extract bounded contexts (auth, users, tasks)
- Use **Strangler Fig Pattern**: Incrementally move modules behind API gateway
- First candidate: **Task Service** (most business logic, independent domain)
- Last candidate: **Auth Service** (shared across all services)

**Trade-offs**:
- **Complexity**: Distributed systems add network latency, eventual consistency, debugging challenges
- **Transactions**: Cross-service transactions require sagas/2PC (complex)
- **Data Duplication**: Each service owns its data, requiring replication
- **Operational Overhead**: Multiple deployments, monitoring, logging aggregation

**Current project is appropriately monolithic** given its scope. The module structure makes future extraction easy if needed.

---

## Folder Structure & Organization

### Q3: Why did you organize code by feature (modules/auth, modules/users) instead of by technical layer (controllers/, services/, models/)?

**Answer:**

**Feature-based organization** (also called "vertical slicing" or "domain-driven structure") offers significant advantages over layer-based organization:

**1. Cohesion and Locality**

When working on the **auth** feature, everything I need is in `modules/auth/`:
- Routes, controllers, services, models, validation, resolvers
- I don't jump between 6 different folders to understand authentication

**Layer-based structure** would require navigating:
```
controllers/auth.controller.ts
services/auth.service.ts
models/auth.model.ts
routes/auth.routes.ts
validation/auth.validation.ts
resolvers/auth.resolver.ts
```

This context switching slows development and makes onboarding harder.

**2. Encapsulation**

Each module is a **bounded context**. The `auth` module owns its domain logic. If we need to refactor authentication, the blast radius is limited to `modules/auth/`.

**3. Team Scalability**

With feature-based structure, multiple teams can work independently:
- **Team A** works on `modules/tasks/` (task management features)
- **Team B** works on `modules/notifications/` (new module)
- Minimal merge conflicts

**4. Microservices Readiness**

If we extract the task module into a microservice, we copy `modules/tasks/` and add an API layer. The domain logic is already isolated.

**5. Clear Dependencies**

Cross-module dependencies are explicit:
```typescript
// auth.service.ts
import { userDAL } from '../users/user.model'; // Clear dependency on users module
```

This makes dependency graphs visible and prevents circular dependencies.

**When Layer-Based Makes Sense**:
- Tiny projects (< 5 files)
- Shared technical infrastructure (e.g., `middleware/`, `utils/` folders)
- When technical concerns dominate (e.g., a middleware library)

**Hybrid Approach (This Project)**:
```
src/
  modules/        # Feature-based (vertical slices)
    auth/
    users/
    tasks/
  middleware/     # Technical layer (cross-cutting)
  utils/          # Technical layer (shared utilities)
  interfaces/     # Technical layer (shared types)
  config/         # Technical layer (infrastructure)
```

This combines the benefits of both: feature cohesion with shared infrastructure.

---

### Q4: Each module has 8-9 files (model, service, controller, resolver, routes, schema, validation, types). Isn't this over-engineering?

**Answer:**

**No, this is appropriate separation of concerns** for a production-grade system. Each file has a distinct responsibility:

**1. `*.model.ts` (Data Access Layer)**
```typescript
// Pure database operations, no business logic
export const userDAL = {
  async create(name, email, passwordHash) { /* SQL INSERT */ },
  async findById(id) { /* SQL SELECT */ },
};
```
- **Why separate**: Abstracts database from business logic
- **Testability**: Mock DAL in service tests
- **Flexibility**: Swap database without touching services

**2. `*.service.ts` (Business Logic Layer)**
```typescript
// Domain logic, authorization, orchestration
export class UserService {
  static async create(data) {
    if (await userDAL.isEmailTaken(data.email)) {
      throw new ConflictError('Email taken'); // Business rule
    }
    // Hash password, create user, return without sensitive data
  }
}
```
- **Why separate**: Reusable across REST and GraphQL
- **Testability**: Test business rules independently of HTTP
- **SRP**: Service only knows domain logic, not HTTP or GraphQL specifics

**3. `*.controller.ts` (REST Request Handler)**
```typescript
// HTTP-specific: parse request, call service, format response
export class UserController {
  static async createUser(req, res, next) {
    const validated = CreateUserSchema.parse(req.body);
    const user = await UserService.create(validated);
    res.status(201).json({ success: true, data: user });
  }
}
```
- **Why separate**: Controllers shouldn't contain business logic (thin controllers)
- **HTTP coupling**: Only this layer knows about Express types

**4. `*.resolver.ts` (GraphQL Query/Mutation Handler)**
```typescript
// GraphQL-specific: extract args, call service, handle GraphQL errors
export const userResolvers = {
  Mutation: {
    createUser: async (_parent, { input }, context) => {
      if (context.user?.role !== 'admin') throw new GraphQLError('Forbidden');
      return await UserService.create(input);
    }
  }
};
```
- **Why separate**: GraphQL and REST call the same service
- **Code reuse**: No duplication of business logic

**5. `*.routes.ts` (Express Route Definitions)**
```typescript
// Declarative route configuration
router.post('/', authMiddleware, adminMiddleware, UserController.createUser);
router.get('/:id', authMiddleware, UserController.getUserById);
```
- **Why separate**: Clear API surface area
- **Middleware composition**: Visible authentication/authorization requirements

**6. `*.schema.ts` (GraphQL Type Definitions)**
```typescript
// GraphQL schema (types, queries, mutations)
export const userTypeDefs = gql`
  type User { id: ID!, name: String!, email: String! }
  type Query { user(id: ID!): User }
`;
```
- **Why separate**: Schema-first GraphQL development
- **Code generation**: Used by graphql-codegen

**7. `*.validation.ts` (Input Validation Schemas)**
```typescript
// Zod schemas for runtime validation
export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});
```
- **Why separate**: Reusable validation across REST and GraphQL
- **Type inference**: `z.infer<typeof CreateUserSchema>` generates TypeScript types

**8. `*.types.ts` (TypeScript Type Definitions)**
```typescript
// Domain-specific types not covered by interfaces/
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
```
- **Why separate**: Module-specific types (not shared globally)

**Benefits of This Structure**:
- **Single Responsibility**: Each file has one reason to change
- **Easy Navigation**: Predictable file names (every module follows same pattern)
- **Parallel Development**: One developer can work on GraphQL while another works on REST
- **Code Reuse**: Service layer shared by REST, GraphQL, CLI tools, background jobs
- **Testing**: Mock at layer boundaries (controller tests mock services, service tests mock DAL)

**Alternative (Not Chosen)**:
```typescript
// modules/users.ts (single file)
export const userRoutes = Router();
userRoutes.post('/', async (req, res) => {
  // Validation, business logic, database query, response - all mixed
});
```
**Why this is worse**:
- Violates SRP (hard to test)
- No code reuse (GraphQL would duplicate logic)
- Hard to scale (file becomes 1000+ lines)
- Tight coupling (can't swap database or API layer)

**Conclusion**: The 8-file structure is **not over-engineering**, it's **engineering for maintainability, testability, and extensibility**. For a toy project, fewer files work. For production code that will be maintained by a team, this separation pays dividends.

---

## TypeScript Usage

### Q5: Why use TypeScript for this project? What specific benefits did you leverage?

**Answer:**

TypeScript provides **type safety, developer experience, and maintainability** that are critical for production systems:

**1. Type Safety (Catch Errors at Compile Time)**

```typescript
// ❌ JavaScript: Runtime error
function getUser(id) {
  return userDAL.findById(id.toUpperCase()); // id might not be a string
}
getUser(123); // Fails at runtime

// ✅ TypeScript: Compile-time error
function getUser(id: string): Promise<User> {
  return userDAL.findById(id.toUpperCase());
}
getUser(123); // Error: Argument of type 'number' is not assignable to type 'string'
```

**2. Interfaces for Domain Modeling**

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user"; // Union type prevents invalid roles
}

// Type-safe data access
const user: User = await userDAL.findById(id);
console.log(user.rol); // Error: Property 'rol' does not exist. Did you mean 'role'?
```

**3. Enum-like Types (Better than Magic Strings)**

```typescript
// ❌ JavaScript: Magic strings everywhere
if (task.status === "COMPLATED") { /* typo not caught */ }

// ✅ TypeScript: Union types prevent typos
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
const status: TaskStatus = "COMPLATED"; // Error: Type '"COMPLATED"' is not assignable
```

**4. Type Inference (Less Boilerplate)**

```typescript
// Zod schema → TypeScript type (no duplication)
export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
// TypeScript infers: { name: string; email: string; }
```

**5. Refactoring Safety**

When I renamed `UserWithoutPassword` to `SafeUser`, TypeScript highlighted **all 15 locations** that needed updates. JavaScript would require manual search (error-prone).

**6. IDE Support (IntelliSense)**

```typescript
// Autocomplete shows: create, findById, findByEmail, update, delete
userDAL. // <-- Immediate autocomplete

// Parameter hints
jwt.sign({ id: user.id }, secret, { expiresIn: '7d' });
//                                  ^ Shows all JWTOptions
```

**7. Self-Documenting Code**

```typescript
// TypeScript signatures are documentation
async function updateTask(
  taskId: string,
  data: UpdateTaskInput,
  role: "admin" | "user",
  userId: string
): Promise<TaskWithUser>;

// JavaScript version requires comments or external docs
async function updateTask(taskId, data, role, userId) { /* ... */ }
```

**8. Null Safety (Strict Mode)**

```typescript
// tsconfig.json: "strict": true

const user = await userDAL.findById(id); // user: User | null
console.log(user.email); // Error: Object is possibly 'null'

// Forces null checks
if (!user) throw new NotFoundError("User not found");
console.log(user.email); // OK, TypeScript knows user is not null
```

**9. Generic Types (Type-Safe DAL)**

```typescript
async function findAll<T>(query: string): Promise<T[]> {
  return db.all<T[]>(query);
}

const users = await findAll<User>("SELECT * FROM users");
// users is typed as User[], not any[]
```

**10. Advanced TypeScript Features Used**

**Utility Types**:
```typescript
// Remove sensitive fields
type UserWithoutPassword = Omit<User, 'passwordHash'>;

// Make all fields optional (for updates)
type UpdateUserInput = Partial<Pick<User, 'name' | 'position' | 'jobDescription'>>;
```

**Type Guards**:
```typescript
if (error instanceof NotFoundError) {
  res.status(404).json({ message: error.message });
}
```

**Declaration Merging (Express Types)**:
```typescript
// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; };
    }
  }
}

// Now req.user is typed everywhere
const userId = req.user.id; // Type-safe
```

**Configuration (`tsconfig.json`)**:
```json
{
  "strict": true,           // Enable all strict checks
  "noUnusedLocals": true,   // Error on unused variables
  "noUnusedParameters": true, // Error on unused parameters
  "esModuleInterop": true,  // Better import compatibility
  "skipLibCheck": true      // Faster compilation
}
```

**Why Not JavaScript?**

- **Runtime errors**: Type mismatches only caught in production
- **Refactoring risk**: No tooling to find all usages
- **Poor IDE support**: No autocomplete, parameter hints
- **Documentation burden**: Need JSDoc comments everywhere
- **Team scalability**: Hard for new developers to understand data shapes

**Trade-offs**:
- **Compilation step**: Adds ~1-2 seconds (negligible with `ts-node-dev`)
- **Learning curve**: Junior developers need TypeScript training
- **Type gymnastics**: Complex types can be hard to read (use sparingly)

**Conclusion**: TypeScript's benefits (type safety, refactoring confidence, DX) far outweigh the minimal compilation cost for production systems.

---

### Q6: You use `strict: true` in tsconfig. What does this enable and why is it important?

**Answer:**

**`"strict": true"`** is a meta-flag that enables **all strict type-checking options** in TypeScript. It's critical for production code because it catches an entire class of bugs at compile time.

**Strict Mode Enables These Checks**:

**1. `strictNullChecks` (Most Important)**

```typescript
// Without strict: null/undefined are valid for all types
function getUser(id: string): User {
  return userDAL.findById(id); // findById returns User | null
  // No error, but runtime crash if null
}

// With strict: Must handle null explicitly
function getUser(id: string): User {
  const user = userDAL.findById(id); // Type: User | null
  if (!user) throw new NotFoundError("Not found"); // Must check null
  return user; // Type narrowed to User
}
```

**Why important**: Prevents **billion-dollar mistake** (Tony Hoare). Most production bugs are null reference errors.

**2. `strictFunctionTypes`**

```typescript
// Ensures function parameters are contravariant (type-safe)
type Handler = (user: User) => void;

// Without strict: Can assign incompatible function
const handler: Handler = (admin: Admin) => { /* ... */ }; // No error, but wrong

// With strict: Error caught
// Error: Type 'Admin' is not assignable to type 'User'
```

**3. `strictBindCallApply`**

```typescript
function greet(name: string, age: number) {
  console.log(`${name} is ${age}`);
}

// Without strict: Arguments not checked
greet.call(null, 'Alice', 'thirty'); // Runtime error

// With strict: Compile-time error
greet.call(null, 'Alice', 'thirty');
// Error: Argument of type 'string' is not assignable to type 'number'
```

**4. `strictPropertyInitialization`**

```typescript
class UserService {
  private db: Database; // Error: Property 'db' has no initializer

  constructor() {
    // Must initialize db here or in declaration
    this.db = getDB();
  }
}
```

**5. `noImplicitAny`**

```typescript
// Without strict: Implicit 'any' type
function processUser(user) { // user: any (no type safety)
  return user.name.toUpperCase();
}

// With strict: Must type explicitly
function processUser(user: User) { // Type-safe
  return user.name.toUpperCase();
}
```

**6. `noImplicitThis`**

```typescript
// Without strict: 'this' is implicitly 'any'
function logUser() {
  console.log(this.name); // No error, but 'this' is unknown
}

// With strict: Must type 'this'
function logUser(this: User) {
  console.log(this.name); // Type-safe
}
```

**7. `alwaysStrict`**

Ensures all files are compiled in ECMAScript strict mode (`"use strict"`):
- Prevents accidental globals
- Disallows `with` statements
- Throws errors on unsafe operations

**Additional Strict Config Used**:

```json
{
  "noUnusedLocals": true,       // Error on unused variables
  "noUnusedParameters": true,   // Error on unused function parameters
}
```

**Example: Catching Unused Code**

```typescript
// Error: 'calculateTotal' is declared but never used
function calculateTotal(items: Item[]) { /* ... */ }

// Forces cleanup of dead code
```

**Real-World Impact in This Project**:

**Before Strict Mode** (hypothetical):
```typescript
async function getTaskById(id: string) {
  const task = await taskDAL.findById(id); // task: Task | null
  return task.title; // Runtime error if task is null
}
```

**After Strict Mode** (actual code):
```typescript
async function getTaskById(id: string) {
  const task = await taskDAL.findById(id); // task: Task | null
  if (!task) {
    throw new NotFoundError("Task not found"); // Forced null check
  }
  return task.title; // TypeScript knows task is not null
}
```

**Why Not Enable Strict Mode?**

- **Legacy codebases**: Enabling strict on old JS code causes 1000+ errors
- **Rapid prototyping**: Strict mode slows down experiments (disabled temporarily)

**Migration Strategy for Legacy Code**:
```json
{
  "strict": true,
  "skipLibCheck": true,  // Ignore errors in node_modules
  "exclude": ["legacy/"] // Gradually migrate folders
}
```

**Conclusion**: `strict: true` is **non-negotiable for new TypeScript projects**. It prevents entire categories of bugs and costs nothing (just requires thinking about types upfront).

---

## Node.js Internals

### Q7: Explain Node.js event loop. How does it handle asynchronous operations in this project?

**Answer:**

Node.js uses a **single-threaded event loop** with **non-blocking I/O** to handle concurrency. Understanding the event loop is critical for writing performant backend services.

**Event Loop Phases**:

```
   ┌───────────────────────────┐
┌─>│           timers          │  (setTimeout, setInterval callbacks)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  (I/O callbacks deferred from previous cycle)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  (internal use only)
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  │  (retrieve new I/O events)│      │   data, etc.  │
│  └─────────────┬─────────────┘      └───────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  (setImmediate callbacks)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  (socket.on('close'))
   └───────────────────────────┘
```

**How This Project Uses the Event Loop**:

**1. Database Queries (Poll Phase)**

```typescript
// Non-blocking database query
const user = await userDAL.findById(id);
```

**What happens**:
1. `findById` initiates SQLite query (C++ libuv thread pool)
2. Event loop **doesn't wait**, continues processing other events
3. When query completes, callback is queued in **poll phase**
4. Event loop executes callback, resumes async function

**2. JWT Verification (Synchronous, Blocks Event Loop)**

```typescript
// Synchronous CPU-bound operation
const decoded = jwt.verify(token, JWT_SECRET);
```

**Why this is acceptable**:
- JWT verification is **fast** (<1ms for typical tokens)
- Bcrypt hashing (10 rounds) takes ~50-100ms but is unavoidable
- For heavy crypto, use `crypto.pbkdf2` (async version)

**3. Bcrypt Hashing (Thread Pool)**

```typescript
// Async CPU-bound operation (uses libuv thread pool)
const hash = await bcrypt.hash(password, 10);
```

**What happens**:
1. Bcrypt offloads hashing to **libuv thread pool** (4 threads by default)
2. Event loop is free to handle other requests
3. When hashing completes, callback queued

**4. Express Request Handling**

```typescript
app.post('/api/auth/login', async (req, res) => {
  const user = await userDAL.findByEmail(req.body.email); // Non-blocking
  const valid = await bcrypt.compare(req.body.password, user.passwordHash); // Non-blocking
  res.json({ token: generateToken(user) });
});
```

**Concurrency Model**:
- Server handles **1000 concurrent requests** with single thread
- Each `await` yields control back to event loop
- Event loop processes next request while waiting for I/O

**Event Loop in This Project (Request Lifecycle)**:

```
Client Request → Express Router → Middleware (authMiddleware)
                                     ↓ (await jwt.verify - sync but fast)
                                  Controller
                                     ↓ (await Service call)
                                  Service
                                     ↓ (await DAL call)
                                  Database Query (I/O - non-blocking)
                                     ↓ (event loop processes other requests)
                                  Query Result → Service → Controller
                                     ↓
                                  Response to Client
```

**Event Loop Performance Characteristics**:

**✅ Non-Blocking (Good for Event Loop)**:
- Database queries (`db.get`, `db.all`)
- HTTP requests (if using `fetch` or `axios`)
- File I/O (`fs.promises.readFile`)
- Timers (`setTimeout`, `setInterval`)

**❌ Blocking (Bad for Event Loop)**:
- Synchronous file I/O (`fs.readFileSync`)
- Heavy CPU computation (image processing, video encoding)
- Infinite loops

**Avoiding Event Loop Blocking**:

```typescript
// ❌ BAD: Blocks event loop for 100ms per request
app.post('/api/hash', (req, res) => {
  const hash = crypto.pbkdf2Sync(req.body.password, salt, 100000, 64, 'sha512');
  res.json({ hash });
});

// ✅ GOOD: Non-blocking (uses thread pool)
app.post('/api/hash', async (req, res) => {
  const hash = await util.promisify(crypto.pbkdf2)(req.body.password, salt, 100000, 64, 'sha512');
  res.json({ hash });
});
```

**Thread Pool Configuration**:

```typescript
// Increase thread pool size for CPU-intensive workloads
// .env
UV_THREADPOOL_SIZE=16

// Default is 4 threads (fine for this project)
```

**Event Loop Monitoring (Production)**:

```typescript
// Detect event loop lag (indicates blocking operations)
const start = Date.now();
setInterval(() => {
  const lag = Date.now() - start - 1000;
  if (lag > 100) {
    logger.warn('Event loop lag detected', { lag });
  }
}, 1000);
```

**Conclusion**: This project leverages Node.js's async I/O for database queries and bcrypt operations, ensuring the event loop remains responsive even under high load. The single-threaded model handles concurrency efficiently for I/O-bound workloads like API servers.

---

### Q8: What are the performance implications of using async/await vs callbacks vs promises in Node.js?

**Answer:**

**Performance Hierarchy** (fastest to slowest):

1. **Callbacks** (fastest, no overhead)
2. **Promises** (microtask queue overhead)
3. **Async/Await** (syntactic sugar over promises, identical perf)

**However, performance difference is negligible** (<1% in real-world apps). **Developer experience and code readability** are far more important.

**1. Callbacks (Legacy Pattern)**

```typescript
// Callback hell (pyramid of doom)
userDAL.findByEmail(email, (err, user) => {
  if (err) return handleError(err);
  if (!user) return handleNotFound();
  
  bcrypt.compare(password, user.passwordHash, (err, valid) => {
    if (err) return handleError(err);
    if (!valid) return handleInvalidPassword();
    
    jwt.sign({ id: user.id }, secret, (err, token) => {
      if (err) return handleError(err);
      res.json({ token });
    });
  });
});
```

**Pros**:
- Lowest overhead (no promise creation)
- Direct event loop integration

**Cons**:
- Callback hell (unreadable)
- Error handling is manual (easy to forget)
- No built-in error propagation

**2. Promises**

```typescript
// Promise chaining
userDAL.findByEmail(email)
  .then(user => {
    if (!user) throw new NotFoundError();
    return bcrypt.compare(password, user.passwordHash)
      .then(valid => {
        if (!valid) throw new AuthError();
        return jwt.sign({ id: user.id }, secret);
      });
  })
  .then(token => res.json({ token }))
  .catch(err => handleError(err));
```

**Pros**:
- Flattens callback hell
- Built-in error propagation (`.catch`)
- Composable (Promise.all, Promise.race)

**Cons**:
- Still nested (not as clean as async/await)
- Microtask queue overhead (~0.1ms per promise)

**3. Async/Await (Modern Standard)**

```typescript
// Linear, readable code
async function login(email: string, password: string) {
  const user = await userDAL.findByEmail(email);
  if (!user) throw new NotFoundError();
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthError();
  
  const token = await jwt.sign({ id: user.id }, secret);
  return { token };
}
```

**Pros**:
- **Readable**: Looks like synchronous code
- **Error handling**: Standard try/catch
- **Debugging**: Stack traces are clearer
- **Control flow**: Easy to use loops, conditionals

**Cons**:
- Identical overhead to raw promises
- Can hide parallelization opportunities (see below)

**Performance Trap: Sequential vs Parallel**

```typescript
// ❌ BAD: Sequential (150ms total)
const user = await userDAL.findById(userId);      // 50ms
const tasks = await taskDAL.findByUserId(userId); // 50ms
const stats = await taskDAL.getStats(userId);     // 50ms

// ✅ GOOD: Parallel (50ms total)
const [user, tasks, stats] = await Promise.all([
  userDAL.findById(userId),      // All run concurrently
  taskDAL.findByUserId(userId),
  taskDAL.getStats(userId)
]);
```

**When to Parallelize**:
- Operations are **independent** (no data dependencies)
- I/O-bound (database, API calls, file reads)

**When to Serialize**:
- Operations depend on previous results
- Need to preserve order (e.g., database transactions)

**This Project's Usage**:

**Sequential (Correct)**:
```typescript
// Login requires sequential operations
const user = await userDAL.findByEmail(email);    // Must find user first
const valid = await bcrypt.compare(password, user.passwordHash); // Then verify password
const token = jwt.sign({ id: user.id }, secret);  // Then generate token
```

**Parallel Opportunity (Not Used, But Could Be)**:
```typescript
// Dashboard endpoint could parallelize
async function getDashboard(userId: string) {
  const [user, tasks, stats] = await Promise.all([
    userDAL.findById(userId),
    taskDAL.findByUserId(userId),
    taskDAL.getTaskStats('user', userId)
  ]);
  return { user, tasks, stats };
}
```

**Microtask Queue Overhead**:

Promises use the **microtask queue** (higher priority than macrotasks like setTimeout):

```
Event Loop Cycle:
1. Execute script (synchronous code)
2. Process microtask queue (promises, queueMicrotask)
3. Process macrotask queue (setTimeout, setImmediate)
4. Repeat
```

**Overhead**: ~0.05-0.1ms per promise creation/resolution. For API servers handling 100ms+ database queries, this is **negligible** (<0.1% overhead).

**Benchmark (Real-World)**:

```typescript
// 1 million operations
// Callbacks:      120ms
// Promises:       125ms (4% slower)
// Async/Await:    125ms (identical to promises)
```

**Conclusion**: Use **async/await** for readability. Performance difference is insignificant. Optimize by parallelizing independent operations with `Promise.all`.

---

## Express.js Lifecycle

### Q9: Walk through the complete request lifecycle in Express for this application. What happens when a request hits `/api/tasks`?

**Answer:**

Let me trace a **GET /api/tasks** request through the entire Express lifecycle:

**1. Request Arrives (TCP/HTTP Layer)**

```
Client → TCP Connection → HTTP Parser → Express Router
```

**2. Express Middleware Stack (app.ts)**

```typescript
// app.ts - Middleware execution order
app.use(cors());                           // ← Step 1: CORS
app.use((req, res, next) => {              // ← Step 2: Conditional JSON parser
  if (req.path === '/graphql') {
    next();
  } else {
    express.json()(req, res, next);        // Parse JSON body
  }
});

app.use("/api/tasks", taskRoutes);         // ← Step 3: Route to task router
app.use(errorHandler);                     // ← Step 7: Catch errors
```

**Detailed Step-by-Step**:

**Step 1: CORS Middleware**

```typescript
// cors() adds headers to allow cross-origin requests
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
// Continues to next middleware
next();
```

**Step 2: JSON Body Parser**

```typescript
// Parses incoming JSON body (req.body is now an object)
// Skipped for /graphql (Apollo has its own parser)
express.json()(req, res, next);
```

**Step 3: Router Matching**

```typescript
// Express finds matching route: /api/tasks
app.use("/api/tasks", taskRoutes);

// Now inside task.routes.ts
router.use(authMiddleware);  // ← Step 4: Authentication
router.get("/", TaskController.getAllTasks); // ← Step 5: Route handler
```

**Step 4: Authentication Middleware**

```typescript
// auth.middleware.ts
export const authMiddleware = (req, res, next) => {
  try {
    // Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    
    // Attach user to request (available in controller)
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next(); // Pass to next middleware/controller
  } catch (error) {
    // Invalid/expired token
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
```

**Step 5: Controller Handler**

```typescript
// task.controller.ts
static async getAllTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      // Shouldn't happen (authMiddleware checks this)
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Call service layer (business logic)
    const tasks = await TaskService.getAllTasks(req.user.role, req.user.id);
    
    // Return successful response
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    // Pass errors to error handler
    next(error);
  }
}
```

**Step 6: Service Layer**

```typescript
// task.service.ts
static async getAllTasks(role: string, userId: string): Promise<TaskWithUser[]> {
  if (role === "admin") {
    // Admins see all tasks
    return await taskDAL.findAllWithUsers();
  } else {
    // Regular users see only their assigned tasks
    return await taskDAL.findByAssignedToWithUser(userId);
  }
}
```

**Step 6a: Data Access Layer**

```typescript
// task.model.ts
async findAllWithUsers(): Promise<TaskWithUser[]> {
  const db = getDB();
  
  // Execute SQL query (non-blocking)
  const tasks = await db.all<TaskWithUserRow[]>(`
    SELECT 
      t.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM tasks t
    LEFT JOIN users u ON t.assignedTo = u.id
    ORDER BY t.createdAt DESC
  `);

  // Transform database rows to domain objects
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    assignedToUser: task.user_id ? {
      id: task.user_id,
      name: task.user_name,
      email: task.user_email
    } : undefined
  }));
}
```

**Step 7: Response Sent**

```typescript
// Controller sends response
res.status(200).json({
  success: true,
  data: [
    {
      id: "task-uuid-1",
      title: "Implement authentication",
      status: "COMPLETED",
      assignedToUser: {
        id: "user-uuid-1",
        name: "Ashraf Diab",
        email: "ashraf@example.com"
      }
    }
  ]
});
```

**Step 8: Error Handling (If Exception Thrown)**

```typescript
// If service throws error, controller calls next(error)
// Express routes to error handler middleware

// error.middleware.ts
export const errorHandler = (err: AppError, _req, res, _next) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message
  });
};
```

**Complete Flow Diagram**:

```
┌─────────────────────────────────────────────────────────────┐
│  Client Request: GET /api/tasks                             │
│  Headers: Authorization: Bearer <token>                     │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  1. CORS Middleware (app.use(cors()))                        │
│     - Adds Access-Control-* headers                          │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  2. JSON Parser (express.json())                             │
│     - Parses req.body (empty for GET)                        │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  3. Route Matching (app.use("/api/tasks", taskRoutes))      │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  4. Auth Middleware (router.use(authMiddleware))             │
│     - Verify JWT token                                       │
│     - Set req.user = { id, role }                            │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  5. Controller (TaskController.getAllTasks)                  │
│     - Extract req.user                                       │
│     - Call TaskService.getAllTasks(role, userId)             │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  6. Service Layer (TaskService.getAllTasks)                  │
│     - Authorization logic (admin vs user)                    │
│     - Call DAL (taskDAL.findAllWithUsers or findByUser)      │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  7. Data Access Layer (taskDAL)                              │
│     - Execute SQL query (await db.all(...))                  │
│     - Transform DB rows to domain objects                    │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  8. Return Data (Service → Controller)                       │
│     - Controller: res.json({ success: true, data: tasks })   │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│  9. Response Sent to Client                                  │
│     Status: 200 OK                                           │
│     Body: { success: true, data: [...] }                     │
└──────────────────────────────────────────────────────────────┘
```

**Error Flow**:

```
Service throws NotFoundError
       ↓
Controller: next(error)
       ↓
errorHandler middleware
       ↓
res.status(404).json({ success: false, error: "Task not found" })
```

**Performance Characteristics**:

- **Middleware overhead**: ~0.1-0.5ms per middleware
- **JWT verification**: ~0.5-1ms (synchronous crypto)
- **Database query**: 5-50ms (depends on table size, indexes)
- **JSON serialization**: ~1-2ms (for typical response size)
- **Total response time**: ~10-100ms (dominated by database)

**Conclusion**: Express's middleware pattern provides clean separation of concerns. Each layer (auth, routing, business logic, data access) is independently testable and replaceable.

---

### Q10: Why do you apply middleware at different levels (app-level, router-level)? What's the strategy?

**Answer:**

**Middleware can be applied at three levels** in Express, each with different scopes and purposes:

**1. Application-Level Middleware** (`app.use`)

```typescript
// app.ts - Applies to ALL routes
app.use(cors());                    // Every request gets CORS headers
app.use(express.json());            // Parse JSON for all routes (except /graphql)
app.use(errorHandler);              // Catch all errors
```

**Purpose**: Cross-cutting concerns that affect the entire application.

**2. Router-Level Middleware** (`router.use`)

```typescript
// task.routes.ts - Applies to ALL /api/tasks/* routes
const router = Router();
router.use(authMiddleware);  // All task routes require authentication

router.get("/", TaskController.getAllTasks);        // Protected
router.post("/", TaskController.createTask);        // Protected
router.delete("/:id", TaskController.deleteTask);   // Protected
```

**Purpose**: Feature-specific middleware (auth for all task endpoints).

**3. Route-Level Middleware** (specific routes)

```typescript
// user.routes.ts - Selective middleware application
const router = Router();
router.use(authMiddleware);  // Base authentication for all

router.post("/", adminMiddleware, UserController.createUser);  // Admin only
router.get("/", UserController.getAllUsers);                   // Any authenticated user
router.delete("/:id", adminMiddleware, UserController.deleteUser); // Admin only
```

**Purpose**: Fine-grained authorization per endpoint.

**Strategy in This Project**:

**Application Level** (Broadest Scope):
- `cors()` - CORS headers for all responses
- `express.json()` - JSON parsing (with /graphql exception)
- `errorHandler` - Global error catching

**Router Level** (Feature-Specific):
- `authMiddleware` on `/api/users` - All user operations need authentication
- `authMiddleware` on `/api/tasks` - All task operations need authentication
- **No auth** on `/api/auth` - Registration/login are public

**Route Level** (Endpoint-Specific):
- `adminMiddleware` on `POST /api/users` - Only admins create users
- `adminMiddleware` on `DELETE /api/users/:id` - Only admins delete users

**Middleware Execution Order**:

```typescript
// Request: POST /api/users
// Execution order:

1. app.use(cors())                    // App-level
2. app.use(express.json())            // App-level
3. app.use("/api/users", userRoutes)  // Route matching
4. router.use(authMiddleware)         // Router-level (in user.routes.ts)
5. router.post("/", adminMiddleware, UserController.createUser) // Route-level
6. UserController.createUser          // Final handler
7. app.use(errorHandler)              // Error handler (if error thrown)
```

**Why Not Put All Auth at App Level?**

```typescript
// ❌ BAD: Auth at app level blocks public routes
app.use(authMiddleware); // Blocks /api/auth/register, /api/auth/login

// ✅ GOOD: Auth at router level, skip for auth routes
app.use("/api/auth", authRoutes);   // No auth required
app.use("/api/users", userRoutes);  // Auth required (in router)
app.use("/api/tasks", taskRoutes);  // Auth required (in router)
```

**Performance Considerations**:

**Early Returns (Efficient)**:
```typescript
// Auth middleware returns immediately on failure
if (!token) {
  return res.status(401).json({ message: "No token" }); // No further processing
}
```

**Conditional Middleware (Advanced)**:
```typescript
// Apply middleware conditionally
const requireAuth = (req, res, next) => {
  if (req.path === '/public') return next(); // Skip auth
  return authMiddleware(req, res, next);
};
```

**Middleware Composition Pattern**:
```typescript
// Compose middleware for reusability
const adminOnly = [authMiddleware, adminMiddleware];
router.post("/users", ...adminOnly, UserController.createUser);
router.delete("/users/:id", ...adminOnly, UserController.deleteUser);
```

**Testing Implications**:

```typescript
// Test middleware independently
describe('authMiddleware', () => {
  it('should reject requests without token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    authMiddleware(req, res, jest.fn());
    
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

**Conclusion**: Layered middleware application provides **fine-grained control** while keeping code DRY. Application-level handles cross-cutting concerns, router-level handles feature auth, and route-level handles specific permissions.

---

## Middleware Flow

### Q11: Your auth middleware modifies `req.user`. How does TypeScript know about this property?

**Answer:**

TypeScript requires **declaration merging** to extend Express's `Request` interface. Without this, `req.user` would throw a type error.

**The Problem**:

```typescript
// auth.middleware.ts
req.user = { id: decoded.id, role: decoded.role };
// Error: Property 'user' does not exist on type 'Request'

// task.controller.ts
const userId = req.user.id;
// Error: Property 'user' does not exist on type 'Request'
```

**The Solution: Declaration Merging**

```typescript
// types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}
```

**How Declaration Merging Works**:

1. **Original Express Definition** (in `@types/express`):
```typescript
namespace Express {
  interface Request {
    body: any;
    params: any;
    query: any;
    // ... other properties
  }
}
```

2. **Our Extension** (in `types/express.d.ts`):
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; }; // Added property
    }
  }
}
```

3. **TypeScript Merges Both**:
```typescript
// Final interface (conceptual)
namespace Express {
  interface Request {
    body: any;
    params: any;
    query: any;
    user?: { id: string; role: string; }; // Our addition
  }
}
```

**Why `declare global`?**

- **Global namespace**: Express types are global (not module-scoped)
- **Ambient declaration**: We're augmenting existing types, not creating new ones

**Why `user?:` (Optional Property)?**

```typescript
interface Request {
  user?: { id: string; role: string; }; // Optional
}
```

**Reason**: Not all routes have authentication middleware:
- `/api/auth/register` - No auth (public)
- `/api/auth/login` - No auth (public)
- `/api/tasks` - Auth required (`req.user` is defined)

**Type Safety in Controllers**:

```typescript
// task.controller.ts
static async getAllTasks(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    // TypeScript knows req.user might be undefined
    return res.status(401).json({ message: "Not authenticated" });
  }

  // After null check, TypeScript narrows the type
  const userId = req.user.id;  // OK: TypeScript knows user is defined
  const role = req.user.role;  // OK
}
```

**Type Narrowing with Type Guards**:

```typescript
// Alternative: Type guard function
function isAuthenticated(req: Request): req is Request & { user: { id: string; role: string } } {
  return req.user !== undefined;
}

// Usage
if (!isAuthenticated(req)) {
  return res.status(401).json({ message: "Not authenticated" });
}

// TypeScript knows req.user is defined (no optional chaining needed)
const userId = req.user.id; // No error, no '?' needed
```

**Including the Declaration File**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"]  // Include custom types
  },
  "include": ["src"]  // Includes src/types/express.d.ts
}
```

TypeScript automatically picks up `src/types/express.d.ts` during compilation.

**Alternative Patterns (Not Used)**:

**1. Module Augmentation** (Explicit Import):
```typescript
// Requires explicit import in every file
import { Request } from "express";

declare module "express" {
  interface Request {
    user?: { id: string; role: string; };
  }
}
```

**2. Custom Request Type** (No Declaration Merging):
```typescript
// Define custom interface
interface AuthenticatedRequest extends Request {
  user: { id: string; role: string; };
}

// Use in controllers
static async getAllTasks(req: AuthenticatedRequest, res: Response) {
  const userId = req.user.id; // OK
}

// Problem: Can't use Express.Request in middleware signatures
```

**Benefits of Declaration Merging**:
- **Automatic**: No imports needed in every file
- **Standard**: Works with Express types everywhere
- **Type-safe**: Catches missing null checks

**Conclusion**: Declaration merging extends Express types cleanly. The optional `user?:` property + null checks provide type safety while supporting both authenticated and public routes.

---

## Database Performance

### Q12: You use LEFT JOIN to fetch tasks with user data. Explain why this is more efficient than separate queries.

**Answer:**

**LEFT JOIN prevents the N+1 query problem**, which is a major performance killer in database-backed applications.

**The N+1 Problem (Bad Approach)**:

```typescript
// ❌ BAD: N+1 queries
async function getAllTasks() {
  // 1 query: Fetch all tasks
  const tasks = await db.all("SELECT * FROM tasks"); // 100 tasks
  
  // N queries: Fetch user for each task (100 queries!)
  for (const task of tasks) {
    if (task.assignedTo) {
      task.assignedToUser = await db.get(
        "SELECT * FROM users WHERE id = ?",
        task.assignedTo
      );
    }
  }
  
  return tasks;
}

// Total: 101 queries (1 + 100)
// Database round-trips: ~101 * 5ms = 505ms
```

**LEFT JOIN Solution (Good Approach)**:

```typescript
// ✅ GOOD: Single query with JOIN
async function getAllTasksWithUsers() {
  const tasks = await db.all(`
    SELECT 
      t.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role
    FROM tasks t
    LEFT JOIN users u ON t.assignedTo = u.id
    ORDER BY t.createdAt DESC
  `);
  
  // Transform flat rows to nested objects (in JavaScript)
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    assignedToUser: task.user_id ? {
      id: task.user_id,
      name: task.user_name,
      email: task.user_email,
      role: task.user_role
    } : undefined
  }));
}

// Total: 1 query
// Database round-trips: ~5ms
```

**Performance Comparison**:

| Approach | Queries | Network Round-trips | Total Time |
|----------|---------|---------------------|------------|
| **N+1 (Bad)** | 101 (1 + 100) | 101 * 5ms | **505ms** |
| **LEFT JOIN (Good)** | 1 | 1 * 5ms | **5ms** |
| **Speedup** | 101x fewer | 101x fewer | **100x faster** |

**Why LEFT JOIN, Not INNER JOIN?**

```sql
-- INNER JOIN: Only tasks WITH assigned users
SELECT t.*, u.name
FROM tasks t
INNER JOIN users u ON t.assignedTo = u.id;
-- Result: Excludes unassigned tasks (assignedTo = NULL)

-- LEFT JOIN: All tasks, including unassigned
SELECT t.*, u.name
FROM tasks t
LEFT JOIN users u ON t.assignedTo = u.id;
-- Result: Includes tasks with assignedTo = NULL (user columns are NULL)
```

**LEFT JOIN ensures we get**:
- Tasks with assigned users (user data populated)
- Tasks without assigned users (user data is NULL)

**Database Execution Plan**:

```sql
EXPLAIN QUERY PLAN
SELECT t.*, u.name
FROM tasks t
LEFT JOIN users u ON t.assignedTo = u.id;

-- SQLite output:
-- SCAN TABLE tasks AS t
-- SEARCH TABLE users AS u USING INDEX sqlite_autoindex_users_1 (id=?)
```

**Key observations**:
- **SCAN tasks**: Sequential scan (OK for small tables)
- **SEARCH users**: Index lookup on `users.id` (fast)
- **Total cost**: O(n) where n = number of tasks

**Index Requirements**:

```sql
-- Primary key on users.id (automatic)
CREATE UNIQUE INDEX sqlite_autoindex_users_1 ON users(id);

-- Recommended: Index on assignedTo for faster joins
CREATE INDEX idx_tasks_assignedTo ON tasks(assignedTo);
```

**With index on `assignedTo`**, database can use **index nested loop join** (faster).

**Data Transformation (Trade-off)**:

```typescript
// Database returns flat rows:
[
  { id: '1', title: 'Task 1', user_id: 'u1', user_name: 'Alice' },
  { id: '2', title: 'Task 2', user_id: 'u2', user_name: 'Bob' },
]

// JavaScript transforms to nested:
[
  { id: '1', title: 'Task 1', assignedToUser: { id: 'u1', name: 'Alice' } },
  { id: '2', title: 'Task 2', assignedToUser: { id: 'u2', name: 'Bob' } },
]
```

**Cost**: ~0.1ms for 100 rows (negligible compared to database query time).

**Alternative Approaches**:

**1. DataLoader (GraphQL)**:
```typescript
// Batches and caches user lookups
const userLoader = new DataLoader(async (userIds) => {
  return await db.all("SELECT * FROM users WHERE id IN (?)", userIds);
});

// Usage
const user = await userLoader.load(task.assignedTo);
```

**Benefits**: Batches multiple loads into single query, caches within request.
**Drawback**: Still 2 queries (tasks + users), more complex than JOIN.

**2. Denormalization**:
```sql
-- Store user name directly in tasks table
ALTER TABLE tasks ADD COLUMN assignedToName TEXT;

-- No JOIN needed
SELECT * FROM tasks;
```

**Benefits**: Fastest reads (1 query, no JOIN).
**Drawbacks**: 
- Data duplication (user name stored twice)
- Stale data (if user name changes, tasks not updated)
- Complex updates (need to update tasks when user changes)

**When to Use Each**:

| Pattern | Use When |
|---------|----------|
| **LEFT JOIN** | Real-time data, moderate scale (<100K rows) |
| **DataLoader** | GraphQL, multiple related queries, need caching |
| **Denormalization** | Read-heavy, data rarely changes, extreme scale |

**Conclusion**: LEFT JOIN is the **right choice** for this project. It provides excellent performance (single query), maintains data consistency, and keeps the schema normalized. The N+1 problem would make the naive approach 100x slower.

---

### Q13: What happens to SQLite performance as the database grows? When would you migrate to PostgreSQL?

**Answer:**

**SQLite Performance Characteristics**:

SQLite is **excellent for small-to-medium datasets** but has limitations at scale:

**Strengths**:
- **Read performance**: Fast for <1M rows with proper indexes
- **Zero configuration**: No server, no network latency
- **ACID compliance**: Full transaction support
- **Lightweight**: ~600KB library, embedded in app

**Weaknesses**:
- **Concurrency**: Single-writer (write locks block reads)
- **Network access**: File-based, not designed for distributed systems
- **Scalability**: Performance degrades beyond 100GB
- **Replication**: No built-in master-slave replication

**Performance Degradation Points**:

**1. Write Concurrency (Most Critical)**

```typescript
// Scenario: 10 concurrent write requests
await Promise.all([
  db.run("INSERT INTO tasks ..."),  // Waits for lock
  db.run("UPDATE users ..."),       // Waits for lock
  db.run("DELETE FROM tasks ..."),  // Waits for lock
]);

// SQLite: Executes serially (single-writer lock)
// PostgreSQL: Executes in parallel (MVCC)
```

**SQLite**: ~100-1000 writes/second (limited by disk I/O)
**PostgreSQL**: ~10,000+ writes/second (parallel writes)

**2. Table Size**

| Table Size | SQLite Performance | PostgreSQL Performance |
|------------|-------------------|------------------------|
| < 10K rows | Excellent (< 5ms) | Excellent (< 5ms) |
| 100K rows | Good (10-50ms) | Excellent (5-10ms) |
| 1M rows | Moderate (50-200ms) | Good (10-50ms) |
| 10M+ rows | Poor (500ms+) | Good (50-200ms) |

**Assumes proper indexing**. Without indexes, both are slow.

**3. Concurrent Readers + Writers**

```
SQLite Write Lock Behavior:
- Write locks entire database
- Reads blocked during writes
- 1 writer OR N readers (exclusive lock)

PostgreSQL MVCC:
- Readers don't block writers
- Writers don't block readers
- N writers AND N readers (multi-version concurrency)
```

**Example**: API serving 100 req/sec, 10% writes:
- **SQLite**: Writes cause 10-100ms latency spikes for reads
- **PostgreSQL**: Reads unaffected by writes

**When to Migrate to PostgreSQL**:

**Migrate When** (Any of These):

**1. Concurrency Limits Reached**
- More than 50-100 concurrent connections
- Write latency spikes due to lock contention
- Database locked errors (`SQLITE_BUSY`)

```typescript
// Symptom: Frequent errors
Error: SQLITE_BUSY: database is locked
```

**2. Dataset Size Growing**
- Database file > 10GB
- Query times > 200ms (with proper indexes)
- Need to store >10M tasks or >1M users

**3. Multi-Server Deployment**
- Need horizontal scaling (multiple app servers)
- SQLite file on NFS/network storage (unreliable)
- Require read replicas for analytics

**4. Advanced Features Needed**
- Full-text search (PostgreSQL has better FTS)
- JSON queries (`SELECT data->>'key' FROM table`)
- Geospatial data (PostGIS extension)
- Pub/Sub (`LISTEN/NOTIFY`)

**5. Backup and Replication**
- Need point-in-time recovery
- Require automatic failover
- Multi-datacenter replication

**Migration Strategy**:

**Phase 1: Prepare Code**
```typescript
// Abstract database access (already done in this project!)
// DAL pattern makes migration easy

// user.model.ts
export const userDAL = {
  async create(name, email, passwordHash) {
    // Currently: SQLite query
    // After migration: PostgreSQL query (same interface)
  }
};
```

**Phase 2: Add PostgreSQL Support**
```typescript
// config/database.ts
import { Pool } from 'pg'; // PostgreSQL client

let pool: Pool | null = null;

export const connectDB = async () => {
  if (process.env.DB_TYPE === 'postgres') {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  } else {
    // Existing SQLite code
  }
};

export const getDB = () => {
  if (pool) return pool; // PostgreSQL
  return db;             // SQLite
};
```

**Phase 3: Migrate Schema**
```sql
-- PostgreSQL schema (similar to SQLite)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Phase 4: Data Migration**
```bash
# Export from SQLite
sqlite3 task-management-system.db .dump > data.sql

# Transform SQL dialect (SQLite → PostgreSQL)
# - Change TEXT to VARCHAR
# - Change INTEGER to INT
# - Change datetime format

# Import to PostgreSQL
psql -d taskdb -f data.sql
```

**Phase 5: Update Queries**

**SQLite** → **PostgreSQL differences**:

```typescript
// 1. Placeholder syntax
// SQLite: ? ? ?
db.run("INSERT INTO users VALUES (?, ?, ?)", [id, name, email]);

// PostgreSQL: $1 $2 $3
pool.query("INSERT INTO users VALUES ($1, $2, $3)", [id, name, email]);

// 2. RETURNING clause (PostgreSQL feature)
// SQLite: Separate query for inserted ID
await db.run("INSERT INTO users ...");
const user = await db.get("SELECT * FROM users WHERE id = ?", id);

// PostgreSQL: Return inserted row
const result = await pool.query(
  "INSERT INTO users ... RETURNING *"
);
const user = result.rows[0];

// 3. UUID generation
// SQLite: Generate in app (uuid.v4())
const id = uuidv4();
await db.run("INSERT INTO users (id, ...) VALUES (?, ...)", [id, ...]);

// PostgreSQL: Generate in database
await pool.query("INSERT INTO users DEFAULT VALUES RETURNING id");
// id is UUID generated by gen_random_uuid()
```

**Cost-Benefit Analysis**:

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| **Setup Complexity** | None | Moderate (server setup) |
| **Operational Cost** | $0 | $20-500/month (managed) |
| **Performance (Small)** | Excellent | Excellent |
| **Performance (Large)** | Poor | Excellent |
| **Concurrency** | Low | High |
| **Scaling** | Vertical only | Horizontal + Vertical |
| **Features** | Basic | Advanced (JSON, FTS, GIS) |

**Recommendation for This Project**:

**Current State (SQLite)**: Appropriate for:
- Demo/portfolio project
- Development environment
- Small teams (<10 users, <10K tasks)
- Single server deployment

**Future State (PostgreSQL)**: Necessary for:
- Production at scale (>1000 users)
- Multiple app servers
- >100 concurrent connections
- Database > 10GB

**Conclusion**: SQLite is **excellent for this hiring task** scope. Migration to PostgreSQL would be triggered by concurrency limits (most common) or dataset size growth. The DAL pattern makes this migration straightforward.

---

## Transactions

### Q14: This project doesn't use database transactions. When would you need them, and how would you implement them?

**Answer:**

**Database transactions** ensure **atomicity** - a group of operations either all succeed or all fail. This project doesn't use transactions because most operations are **single-write**, but production systems often need them.

**ACID Properties**:
- **Atomicity**: All or nothing (transactions provide this)
- **Consistency**: Database remains valid (constraints enforced)
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists

**When Transactions Are Needed**:

**1. Multiple Related Writes**

**Example: Transfer Task Ownership**
```typescript
// ❌ WITHOUT TRANSACTION (Dangerous)
async function transferTask(taskId: string, fromUserId: string, toUserId: string) {
  // Step 1: Unassign from old user
  await db.run("UPDATE tasks SET assignedTo = NULL WHERE id = ?", taskId);
  
  // ⚠️ If crash/error here, task is orphaned (assignedTo = NULL)
  
  // Step 2: Assign to new user
  await db.run("UPDATE tasks SET assignedTo = ? WHERE id = ?", [toUserId, taskId]);
}

// Possible failures:
// - Network timeout between operations
// - Server crash between operations
// - Validation error in step 2
// Result: Task left in inconsistent state (unassigned)

