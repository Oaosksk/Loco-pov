import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Loco] Supabase env vars missing. Running in demo mode.')
}

if (supabaseUrl && supabaseAnonKey) {
  console.log('[Loco] Supabase env vars detected:')
  console.log('  VITE_SUPABASE_URL =', supabaseUrl)
  console.log('  VITE_SUPABASE_ANON_KEY =', `${supabaseAnonKey.slice(0, 12)}...`) // masked
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
)

