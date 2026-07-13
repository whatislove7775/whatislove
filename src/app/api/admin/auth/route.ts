import { NextRequest, NextResponse } from 'next/server';

// Эскалирующая блокировка по IP: 5 неверных попыток → 30с, ещё 5 (10 всего) → 5 мин,
// ещё 5 (15 всего) → 1 день. После истечения дневной блокировки счётчик сбрасывается.
const TIERS = [
  { atCount: 5, lockMs: 30 * 1000 },
  { atCount: 10, lockMs: 5 * 60 * 1000 },
  { atCount: 15, lockMs: 24 * 60 * 60 * 1000 },
];

interface AttemptState { count: number; lockedUntil: number; }
const attempts = new Map<string, AttemptState>();

function getClientKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function formatWait(ms: number): string {
  const sec = Math.ceil(ms / 1000);
  if (sec < 60) return `${sec} сек`;
  const min = Math.ceil(sec / 60);
  if (min < 60) return `${min} мин`;
  const hours = Math.ceil(min / 60);
  return `${hours} ч`;
}

export async function POST(req: NextRequest) {
  const key = getClientKey(req);
  const now = Date.now();
  const state = attempts.get(key);

  if (state && now < state.lockedUntil) {
    return NextResponse.json(
      { ok: false, error: 'too_many_attempts', message: `слишком много попыток, попробуйте через ${formatWait(state.lockedUntil - now)}` },
      { status: 429 }
    );
  }

  // Последняя (дневная) блокировка истекла — начинаем цикл заново.
  if (state && state.count >= TIERS[TIERS.length - 1].atCount) {
    attempts.delete(key);
  }

  const { password } = await req.json();
  if (password && password === process.env.ADMIN_PASSWORD) {
    attempts.delete(key);
    return NextResponse.json({ ok: true });
  }

  const current = attempts.get(key) ?? { count: 0, lockedUntil: 0 };
  current.count++;
  const tier = TIERS.find(t => t.atCount === current.count);
  if (tier) current.lockedUntil = now + tier.lockMs;
  attempts.set(key, current);

  return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 });
}
