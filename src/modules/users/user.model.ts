import { v4 as uuidv4 } from "uuid";
import { getDB } from "../../config/database";
import { User } from "../../interfaces/user.interface";

export { User } from "../../interfaces/user.interface";

export const userDAL = {
  async create(
    name: string,
    email: string,
    passwordHash: string,
    role: "admin" | "user" = "user",
    position?: string,
    jobDescription?: string
  ): Promise<User> {
    const db = getDB();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO users (id, name, email, passwordHash, role, position, jobDescription, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, passwordHash, role, position, jobDescription, now, now]
    );

    return {
      id,
      name,
      email,
      passwordHash,
      role,
      position,
      jobDescription,
      createdAt: now,
      updatedAt: now,
    };
  },

  async findByEmail(email: string): Promise<User | null> {
    const db = getDB();
    const user = await db.get<User>(
      "SELECT * FROM users WHERE email = ?",
      email
    );
    return user || null;
  },

  async findById(id: string): Promise<User | null> {
    const db = getDB();
    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", id);
    return user || null;
  },

  async findAll(): Promise<User[]> {
    const db = getDB();
    return await db.all<User[]>("SELECT * FROM users");
  },

  async update(
    id: string,
    updates: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User | null> {
    const db = getDB();
    const now = new Date().toISOString();
    const user = await this.findById(id);

    if (!user) return null;

    const fields: string[] = [];
    const values: (string | number | null | undefined)[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== "id" && key !== "createdAt") {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return user;

    fields.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    await db.run(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const db = getDB();
    const result = await db.run("DELETE FROM users WHERE id = ?", id);
    return (result.changes ?? 0) > 0;
  },

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  },
};
