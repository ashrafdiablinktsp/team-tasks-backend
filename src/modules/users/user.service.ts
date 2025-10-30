import bcrypt from 'bcryptjs';
import { User, userDAL } from './user.model';

export class AuthenticationError extends Error {}
export class ConflictError extends Error {}
export class NotFoundError extends Error {}

export class UserService {

  static async create(data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
    position?: string;
    jobDescription?: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    if (await userDAL.isEmailTaken(data.email)) {
      console.log('Create user failed: Email already taken');
      throw new ConflictError('Email already taken');
    }
    
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userDAL.create(
      data.name,
      data.email,
      passwordHash,
      data.role || 'user',
      data.position,
      data.jobDescription
    );
    
    console.log('User created:', user.email);
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  static async getById(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await userDAL.findById(id);

    if (!user) {
      console.log('GetById failed: User not found');
      throw new NotFoundError('User not found');
    }

    const { passwordHash, ...rest } = user;
    return rest;
  }

  static async getAll(): Promise<Array<Omit<User, 'passwordHash'>>> {
    const users = await userDAL.findAll();
    return users.map(({ passwordHash, ...rest }) => rest);
  }

  static async update(id: string, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    position: string;
    jobDescription?: string | null;
  }>): Promise<Omit<User, 'passwordHash'>> {
    const user = await userDAL.findById(id);
    if (!user) {
      console.log('Update failed: User not found');
      throw new NotFoundError('User not found');
    }
    if (data.email && data.email !== user.email && await userDAL.isEmailTaken(data.email)) {
      console.log('Update failed: Email already taken');
      throw new ConflictError('Email already taken');
    }
    
    const updateData: Record<string, string | null | undefined> = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }
    
    const updated = await userDAL.update(id, updateData as Partial<Omit<User, "id" | "createdAt">>);
    if (!updated) {
      throw new NotFoundError('User not found after update');
    }
    console.log('User updated:', updated.email);
    const { passwordHash, ...rest } = updated;
    return rest;
  }

  static async delete(id: string): Promise<void> {
    const ok = await userDAL.delete(id);
    if (!ok) {
      console.log('Delete failed: User not found');
      throw new NotFoundError('User not found');
    }
    console.log('User deleted:', id);
  }
}
