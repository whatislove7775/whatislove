import { supabase } from '@/lib/supabase';
import LinksPageClient from '@/components/LinksPageClient';

export const revalidate = 60;

export default async function LinksPage() {
  const { data } = await supabase.from('links').select('id, label, url').order('sort_order', { ascending: true });
  return <LinksPageClient links={data ?? []} />;
}
