import { verifyToken } from '../lib/auth';
import type { MiddlewareResponseHandler } from 'astro';

export const onRequest: MiddlewareResponseHandler = async ({ request, cookies, redirect }) => {
  const token = cookies.get('token')?.value;
  
  if (!token) {
    return redirect('/admin/login');
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return redirect('/admin/login');
  }

  return;
};