import { supabase } from '@/lib/supabase';
import LinksPageClient from '@/components/LinksPageClient';

export const revalidate = 60;

export default async function LinksPage() {
  const [{ data: links }, { data: columns }] = await Promise.all([
    supabase.from('links').select('id, label, url, column_id').order('sort_order', { ascending: true }),
    supabase.from('link_columns').select('id, title, sort_order').order('sort_order', { ascending: true }),
  ]);
  return <LinksPageClient links={links ?? []} columns={columns ?? []} />;
}
