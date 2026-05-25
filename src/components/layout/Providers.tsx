'use client'
// ═══════════════════════════════════════════════
// Providers — wraps the app with all context
// ═══════════════════════════════════════════════
import { useEffect } from 'react'
import { createBrowserSupabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import type { Profile } from '@/types'

export function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useStore((s) => s.setUser)

  useEffect(() => {
    const supabase = createBrowserSupabase()

    // Get current session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser((profile as Profile) ?? null)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUser((profile as Profile) ?? null)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser])

  return <>{children}</>
}
