// Fill these in with your own Supabase project's values.
// Find them in the Supabase dashboard: Project Settings -> API.
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

// The anon key is safe to expose in frontend code - it only works
// together with the Row Level Security rules set up in supabase/schema.sql.
window.sb = (typeof supabase !== 'undefined' && !SUPABASE_URL.includes('YOUR-PROJECT'))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!window.sb) {
  console.warn('Student Toolkit: add your Supabase URL and anon key in js/supabase-client.js to enable accounts.');
}
