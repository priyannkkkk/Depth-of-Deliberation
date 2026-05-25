// ═══════════════════════════════════════════════
// Supabase Client Utilities
// Three clients for three contexts
// ═══════════════════════════════════════════════

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseSvc = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ── 1. Browser client (Client Components) ──
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnon)
}

// ── 2. Server client (Server Components / Route Handlers) ──
export async function createServerSupabase() {
  const { cookies } = await import('next/headers')

  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {}
      },
    },
  })
}

// ── 3. Admin client (Server-only API routes) ──
export function createAdminSupabase() {
  return createClient(supabaseUrl, supabaseSvc, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}