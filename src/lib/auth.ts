import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { client } from './db';

const JWT_SECRET = new TextEncoder().encode('your-secret-key');

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await client.execute({
    sql: 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    args: [email, hashedPassword, name]
  });
}

export async function verifyUser(email: string, password: string) {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });

  const user = result.rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password as string);
  if (!valid) return null;

  return user;
}

export async function createToken(user: any) {
  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}