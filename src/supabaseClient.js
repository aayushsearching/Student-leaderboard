import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Not Loaded');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Not Loaded');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
