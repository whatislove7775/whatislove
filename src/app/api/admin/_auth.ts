import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

// Сессии живут в памяти процесса — при перезапуске сервера все админы
// разлогиниваются, что нормально для внутренней панели.
const sessions = new Map<string, number>(); // token -> expiresAt

export function createSession(): string {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function destroySession(token: string | null) {
  if (token) sessions.delete(token);
}

export function isAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key');
  if (!key) return false;
  const expiresAt = sessions.get(key);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(key);
    return false;
  }
  return true;
}

export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
