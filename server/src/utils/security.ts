import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '@/config/env';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (candidate: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(candidate, hash);
};

interface TokenPayload {
  id: number;
  role: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '15m'
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};

export const generateRandomToken = (bytes: number = 32) => {
  const token = crypto.randomBytes(bytes).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

export const generateNumericOTP = (length: number = 6): string => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};