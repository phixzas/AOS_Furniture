import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://bdvyfnejbzfzwemghvxa.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_O6pKQNJARpVyIxX5ITVP1A_D-yXats5'

export const supabase = url && anonKey ? createClient(url, anonKey) : null