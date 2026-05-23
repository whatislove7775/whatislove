import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const folder = req.nextUrl.searchParams.get('folder') ?? '';
  const supabase = db();
  const { data, error } = await supabase.storage.from('images').list(folder, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const files = (data ?? [])
    .filter(f => f.id) // exclude folders (folders have no id)
    .map(f => {
      const path = folder ? `${folder}/${f.name}` : f.name;
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path);
      return { name: f.name, path, url: urlData.publicUrl, size: f.metadata?.size ?? 0 };
    });

  return NextResponse.json(files);
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });
  const { error } = await db().storage.from('images').remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
