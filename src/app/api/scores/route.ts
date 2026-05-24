import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  const { data, error } = await db()
    .from('scores')
    .select('player_name, score')
    .order('score', { ascending: false })
    .limit(5);
  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { player_name, score } = body;
  if (typeof score !== 'number' || score <= 0 || score > 99999)
    return NextResponse.json({ error: 'invalid score' }, { status: 400 });
  const name = String(player_name ?? '').slice(0, 30).trim() || 'Аноним';
  const { error } = await db().from('scores').insert({ player_name: name, score: Math.round(score) });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
