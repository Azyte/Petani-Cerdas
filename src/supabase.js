import { createClient } from '@supabase/supabase-js';

// Menggunakan Environment Variable dari Vercel/Vite (.env)
// Pastikan file .env (lokal) atau Vercel Environment Variables sudah dikonfigurasi
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { SUPABASE_URL, SUPABASE_ANON_KEY };
