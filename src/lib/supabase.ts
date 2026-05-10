import { createClient } from '@supabase/supabase-js';

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING');
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING');

// ВРЕМЕННО для теста
export const supabase = createClient(
  'https://vhdxdmgcjweqdpkgptcx.supabase.co', 
  'sb_publishable_3b0cwrS_3TohAbSvb3eGmg_Kp_zq7YN'
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
