import { createClient } from '@supabase/supabase-js';

// 1. Оставляем только эту версию для теста
export const supabase = createClient(
  'https://vhdxdmgcjweqdpkgptcx.supabase.co', 
  'sb_publishable_3b0cwrS_3TohAbSvb3eGmg_Kp_zq7YN'
);

// ВСЁ, ЧТО НИЖЕ (строки 12-15), ПРОСТО УДАЛИ ИЛИ ЗАКОММЕНТИРУЙ
