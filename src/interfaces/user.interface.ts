export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  position?: string;
  jobDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithoutPassword extends Omit<User, 'passwordHash'> {}

export interface UpdateUserInput {
  name?: string;
  position?: string;
  jobDescription?: string;
}
