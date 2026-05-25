'use client'
// ═══════════════════════════════════════════════
// Footer + SearchModal + CursorGlow + ToastContainer
// ═══════════════════════════════════════════════
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { createBrowserSupabase } from '@/lib/supabase'
import { debounce } from '@/lib/utils'
import type { Story } from '@/types'

/* ── Footer ─────────────────────────────────── */
export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-14 px-6 text-center">
      <Link
        href="/"
        className="block font-serif font-light text-gold text-[1.35rem] mb-1
                   hover:text-[var(--cream)] transition-colors"
      >
        Depths of Deliberation
      </Link>

      <div
        className="w-10 h-px bg-[var(--border-hover)] mx-auto my-5"
        aria-hidden="true"
      />

      <p className="text-[0.72rem] text-[var(--ink-muted)] leading-[1.9]">
        A collection of stories &amp; reflections woven through<br />
        emotion, healing, overthinking, faith, and self-discovery.
      </p>

      <div className="flex items-center justify-center gap-5 mt-6">
        {['Featured', 'All Stories', 'About', 'Subscribe', 'Contact'].map((label) => (
          <Link
            key={label}
            href={`/#${label.toLowerCase().replace(' ', '-')}`}
            className="text-[0.65rem] tracking-[0.12em] uppercase
                       text-[var(--ink-muted)] hover:text-gold transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-[0.65rem] text-[var(--ink-muted)] opacity-50">
        © {new Date().getFullYear()} Priyank Pateliya · All stories are personal reflections
      </p>
    </footer>
  )
}

/* ── Search modal ────────────────────────────── */
export function SearchModal() {
  const { searchOpen, setSearchOpen } = useStore()
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen])

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      try {
        const supabase = createBrowserSupabase()
        const { data } = await supabase
          .from('stories')
          .select('id,slug,title,excerpt,tags,read_time')
          .eq('status', 'published')
          .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
          .limit(8)
        setResults((data as Story[]) ?? [])
      } finally {
        setLoading(false)
      }
    }, 320),
    []
  )

  const handleChange = (q: string) => {
    setQuery(q)
    doSearch(q)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{  opacity: 0 }}
            className="fixed inset-0 z-[150] bg-[rgba(12,10,8,0.88)] backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{  opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[160]
                       w-full max-w-xl px-4"
            role="dialog"
            aria-label="Search stories"
          >
            {/* Input */}
            <div className="relative bg-[var(--bg-card)] border border-[var(--border-hover)]">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search stories… (⌘K)"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full bg-transparent pl-10 pr-12 py-4
                           text-[var(--ink-primary)] font-sans text-sm
                           placeholder:text-[var(--ink-muted)] outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-[var(--ink-muted)] hover:text-gold transition-colors"
                aria-label="Close search"
              >
                <X size={15} />
              </button>
            </div>

            {/* Results */}
            {(results.length > 0 || loading) && (
              <div className="bg-[var(--bg-card)] border border-t-0 border-[var(--border)]
                              max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="px-5 py-4 text-[var(--ink-muted)] text-sm font-serif italic">
                    Searching…
                  </div>
                ) : (
                  results.map((story) => (
                    <Link
                      key={story.id}
                      href={`/story/${story.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex flex-col px-5 py-4 border-b border-[var(--border)]
                                 hover:bg-[var(--bg-card-hover)] transition-colors group last:border-0"
                    >
                      <span className="text-cream text-sm font-serif group-hover:text-gold transition-colors">
                        {story.title}
                      </span>
                      {story.excerpt && (
                        <span className="text-[var(--ink-muted)] text-[0.75rem] mt-0.5 line-clamp-1 font-serif italic">
                          {story.excerpt}
                        </span>
                      )}
                      <div className="flex gap-1.5 mt-1.5">
                        {story.tags.slice(0, 3).map((t) => (
                          <span key={t} className="tag text-[0.55rem]">{t}</span>
                        ))}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <div className="bg-[var(--bg-card)] border border-t-0 border-[var(--border)]
                              px-5 py-4 text-[var(--ink-muted)] text-sm font-serif italic">
                No stories found for "{query}"
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Cursor glow ─────────────────────────────── */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    const move = (e: MouseEvent) => {
      el.style.left = e.clientX + 'px'
      el.style.top  = e.clientY + 'px'
    }
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={glowRef}
      className="fixed z-0 pointer-events-none rounded-full"
      style={{
        width:      '500px',
        height:     '500px',
        transform:  'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(196,163,90,0.032) 0%, transparent 70%)',
        transition: 'left 0.12s linear, top 0.12s linear',
      }}
      aria-hidden="true"
    />
  )
}

/* ── Toast container ─────────────────────────── */
export function ToastContainer() {
  const { toasts, removeToast } = useStore()

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, y: 0 }}
            animate={{ opacity: 1, x: 0,  y: 0 }}
            exit={{  opacity: 0, x: 40,  y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className={`flex items-center justify-between gap-4 px-5 py-3.5 min-w-[240px]
                        border text-sm
                        ${toast.type === 'error'
                          ? 'bg-red-950 border-red-800/50 text-red-300'
                          : 'bg-[var(--bg-card)] border-[var(--gold-dim)] text-[var(--cream)]'
                        }`}
          >
            <span className="font-sans text-[0.82rem]">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--ink-muted)] hover:text-gold flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
