import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Ensure you have created a .env file and populated the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
