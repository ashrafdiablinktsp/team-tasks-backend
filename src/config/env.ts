import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
  DATABASE_URL: process.env.DATABASE_URL || './task-management-system.db',
};

console.log('Config loaded - JWT_SECRET:', config.JWT_SECRET.substring(0, 20) + '...');