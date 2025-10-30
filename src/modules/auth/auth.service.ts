import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, userDAL } from '../users/user.model';
import { ConflictError, NotFoundError, AuthenticationError } from '../users/user.service';
import { config } from '../../config/env';

export class AuthService {
  static excludePasswordHash(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
    position?: string;
    jobDescription?: string;
  }): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    if (await userDAL.isEmailTaken(data.email)) {
      console.log('Register failed: Email already taken');
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
    console.log('User registered:', user.email);
    
    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: '7d' });
    
    return {
      token,
      user: this.excludePasswordHash(user)
    };
  }

  static async login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    console.log('AuthService.login called with:', { email, password: '***' });
    
    const user = await userDAL.findByEmail(email);
    console.log('User found:', user ? { id: user.id, email: user.email } : 'null');
    
    if (!user) {
      console.log('Login failed: User not found');
      throw new AuthenticationError('Invalid credentials');
    }
    
    console.log('Comparing password...');
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', valid);
    
    if (!valid) {
      console.log('Login failed: Invalid password');
      throw new AuthenticationError('Invalid credentials');
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: '7d' });
    console.log('User logged in successfully:', user.email);
    
    return {
      token,
      user: this.excludePasswordHash(user)
    };
  }

  static async getMe(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await userDAL.findById(id);
    if (!user) {
      console.log('GetMe failed: User not found');
      throw new NotFoundError('User not found');
    }
    return this.excludePasswordHash(user);
  }
}
