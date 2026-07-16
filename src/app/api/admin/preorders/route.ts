import { NextRequest, NextResponse } from 'next/server';
import { getAdminRole, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!(await getAdminRole(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await db()
    .from('preorders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
