'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase'
import { LogOut, Home } from 'lucide-react'

export function AdminNav() {
  const router = useRouter()
  async function signOut() {
    await createBrowserSupabase().auth.signOut()
    router.push('/')
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14
                       bg-[var(--bg-deep)] border-b border-[var(--border)]
                       flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="font-serif text-gold text-sm tracking-wide">Admin</span>
        <span className="text-[var(--ink-muted)] text-[0.6rem]">—</span>
        <span className="font-serif text-[var(--ink-secondary)] text-sm">Depths of Deliberation</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1.5 text-[0.7rem] text-[var(--ink-muted)]
                                   hover:text-gold transition-colors uppercase tracking-wider">
          <Home size={12}/> Site
        </Link>
        <button onClick={signOut}
          className="flex items-center gap-1.5 text-[0.7rem] text-[var(--ink-muted)]
                     hover:text-gold transition-colors uppercase tracking-wider">
          <LogOut size={12}/> Sign out
        </button>
      </div>
    </header>
  )
}
