import { createClient } from '@supabase/supabase-js';

// Supabase projekta URL un anonīmā atslēga no vides mainīgajiem (.env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tavs-projekts.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tava-anon-atslega';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);