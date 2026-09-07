import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole } from '../../domain/Account';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ooad_library_jwt_key_2026';
export const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
  accountId: number;
  userId: number;
  username: string;
  role: UserRole;
  memberId?: number;
  librarianId?: number;
}

// Password Hashing with PBKDF2
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  // Support fallback for plain text or legacy hashes in seed data if needed
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

// JWT Helpers
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
