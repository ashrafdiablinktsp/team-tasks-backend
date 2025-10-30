import { v4 as uuidv4 } from "uuid";
import { getDB } from "../../config/database";
import { Task, TaskWithUser, TaskWithUserRow } from "../../interfaces/task.interface";

export { Task, TaskWithUser, AssignedUser, TaskWithUserRow } from "../../interfaces/task.interface";

export const taskDAL = {
  async create(
    title: string,
    description?: string,
    assignedTo?: string
  ): Promise<Task> {
    const db = getDB();
    const id = uuidv4();
    const now = new Date().toISOString();
    const status = "PENDING";

    await db.run(
      `INSERT INTO tasks (id, title, description, status, assignedTo, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        title, 
        description ?? null, 
        status, 
        assignedTo ?? null, 
        now, 
        now
      ]
    );

    return {
      id,
      title,
      description,
      status,
      assignedTo,
      createdAt: now,
      updatedAt: now,
    };
  },

  async findById(id: string): Promise<Task | null> {
    const db = getDB();
    const task = await db.get<Task>("SELECT * FROM tasks WHERE id = ?", id);
    return task || null;
  },

  async findByIdWithUser(id: string): Promise<TaskWithUser | null> {
    const db = getDB();
    const task = await db.get<TaskWithUserRow>(
      `SELECT 
        t.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.position as user_position,
        u.jobDescription as user_jobDescription,
        u.createdAt as user_createdAt,
        u.updatedAt as user_updatedAt
       FROM tasks t
       LEFT JOIN users u ON t.assignedTo = u.id
       WHERE t.id = ?`,
      id
    );

    if (!task) return null;

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status as Task["status"],
      assignedTo: task.assignedTo ?? undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignedToUser: task.user_id
        ? {
            id: task.user_id,
            name: task.user_name!,
            email: task.user_email!,
            role: task.user_role!,
            position: task.user_position ?? undefined,
            jobDescription: task.user_jobDescription ?? undefined,
            createdAt: task.user_createdAt!,
            updatedAt: task.user_updatedAt!,
          }
        : undefined,
    };
  },

  async findAll(): Promise<Task[]> {
    const db = getDB();
    return await db.all<Task[]>("SELECT * FROM tasks ORDER BY createdAt DESC");
  },

  async findAllWithUsers(): Promise<TaskWithUser[]> {
    const db = getDB();
    const tasks = await db.all<TaskWithUserRow[]>(
      `SELECT 
        t.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.position as user_position,
        u.jobDescription as user_jobDescription,
        u.createdAt as user_createdAt,
        u.updatedAt as user_updatedAt
       FROM tasks t
       LEFT JOIN users u ON t.assignedTo = u.id
       ORDER BY t.createdAt DESC`
    );

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status as Task["status"],
      assignedTo: task.assignedTo ?? undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignedToUser: task.user_id
        ? {
            id: task.user_id,
            name: task.user_name!,
            email: task.user_email!,
            role: task.user_role!,
            position: task.user_position ?? undefined,
            jobDescription: task.user_jobDescription ?? undefined,
            createdAt: task.user_createdAt!,
            updatedAt: task.user_updatedAt!,
          }
        : undefined,
    }));
  },

  async findByAssignedTo(userId: string): Promise<Task[]> {
    const db = getDB();
    return await db.all<Task[]>(
      "SELECT * FROM tasks WHERE assignedTo = ? ORDER BY createdAt DESC",
      userId
    );
  },

  async findByAssignedToWithUser(userId: string): Promise<TaskWithUser[]> {
    const db = getDB();
    const tasks = await db.all<TaskWithUserRow[]>(
      `SELECT 
        t.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.position as user_position,
        u.jobDescription as user_jobDescription,
        u.createdAt as user_createdAt,
        u.updatedAt as user_updatedAt
       FROM tasks t
       LEFT JOIN users u ON t.assignedTo = u.id
       WHERE t.assignedTo = ?
       ORDER BY t.createdAt DESC`,
      userId
    );

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status as Task["status"],
      assignedTo: task.assignedTo ?? undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignedToUser: task.user_id
        ? {
            id: task.user_id,
            name: task.user_name!,
            email: task.user_email!,
            role: task.user_role!,
            position: task.user_position ?? undefined,
            jobDescription: task.user_jobDescription ?? undefined,
            createdAt: task.user_createdAt!,
            updatedAt: task.user_updatedAt!,
          }
        : undefined,
    }));
  },

  async update(
    id: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
  ): Promise<Task | null> {
    const db = getDB();
    const now = new Date().toISOString();
    const task = await this.findById(id);

    if (!task) return null;

    const fields: string[] = [];
    const values: (string | number | null | undefined)[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "createdAt") {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return task;

    fields.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    await db.run(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);

    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const db = getDB();
    const result = await db.run("DELETE FROM tasks WHERE id = ?", id);
    return (result.changes ?? 0) > 0;
  },

  async getTaskStats(role: string, userId?: string): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    total: number;
  }> {
    const db = getDB();
    
    // Admin can see all tasks, users only see their assigned tasks
    const whereClause = role === "admin" ? "" : "WHERE assignedTo = ?";
    const params = role === "admin" ? [] : [userId];

    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM tasks
      ${whereClause}
    `;

    const result = await db.get<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
    }>(query, params);

    return {
      pending: result?.pending ?? 0,
      inProgress: result?.inProgress ?? 0,
      completed: result?.completed ?? 0,
      total: result?.total ?? 0,
    };
  },
};
