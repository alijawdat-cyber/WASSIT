import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload } from '../types';

/**
 * تشفير كلمة المرور باستخدام bcrypt
 * @param password كلمة المرور المراد تشفيرها
 * @returns كلمة المرور المشفرة
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * التحقق من صحة كلمة المرور
 * @param password كلمة المرور المدخلة
 * @param hashedPassword كلمة المرور المشفرة المخزنة
 * @returns صحيح إذا كانت كلمة المرور صحيحة
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * إنشاء JWT token
 * @param payload البيانات المراد تضمينها في الـ token
 * @returns JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * التحقق من صحة الـ token والحصول على البيانات المضمنة
 * @param token JWT token
 * @returns البيانات المضمنة في الـ token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
} 