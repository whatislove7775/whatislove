import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  const { data } = await db().from('settings').select('key, value');
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, value } = body;
  await db().from('settings').upsert({ key, value }, { onConflict: 'key' });
  return NextResponse.json({ ok: true });
}
