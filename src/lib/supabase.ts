import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  return url
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }
  return key
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return _supabase
}

// Server-side client with service role key for admin operations
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is not set - admin operations will fail')
      return null
    }
    _supabaseAdmin = createClient(getSupabaseUrl(), serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return _supabaseAdmin
}

// Export default instance for client-side use (will error gracefully at runtime)
export const supabase = {
  from: () => { throw new Error('Supabase not configured - missing environment variables') },
  storage: { from: () => { throw new Error('Supabase not configured') } }
} as any

// Server-side admin instance (will be null if not configured)
export const supabaseAdmin = null as any