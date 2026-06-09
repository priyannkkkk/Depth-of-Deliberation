'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bookmark, User, Menu, X, LogOut } from 'lucide-react'
import { useStore } from '@/lib/store'
import { createBrowserSupabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Nav() {
  const { user, navScrolled, setNavScrolled, setSearchOpen } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [setNavScrolled])

  async function handleSignOut() {
    const sb = createBrowserSupabase()
    await sb.auth.signOut()
    router.push('/')
    setUserMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] px-8 md:px-16
                  flex items-center justify-between h-16
                  transition-all duration-500
                  ${navScrolled
                    ? 'bg-[rgba(12,10,8,0.97)] backdrop-blur-md border-b border-[var(--border)]'
                    : 'bg-gradient-to-b from-[rgba(12,10,8,0.9)] to-transparent'
                  }`}
    >
      {/* Brand */}
      <Link
        href="/"
        className="font-serif text-[1.12rem] font-medium tracking-[0.06em] text-gold
                   hover:text-[var(--cream)] transition-colors duration-300"
      >
        Depths of Deliberation
      </Link>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-9 list-none">
        {[
          { href: '/#featured',   label: 'Featured' },
          { href: '/#stories',    label: 'All Stories' },
          { href: '/#about',      label: 'About' },
          { href: '/#subscribe',  label: 'Subscribe' },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href as any}
              className="text-[0.72rem] tracking-[0.14em] uppercase
                         text-[var(--ink-secondary)] hover:text-gold
                         transition-colors duration-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right icons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search stories"
          className="text-[var(--ink-muted)] hover:text-gold transition-colors p-1"
        >
          <Search size={16} />
        </button>

        {user ? (
          <>
            <Link
              href={"/bookmarks" as any}
              aria-label="My bookmarks"
              className="text-[var(--ink-muted)] hover:text-gold transition-colors p-1"
            >
              <Bookmark size={16} />
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="User menu"
                className="flex items-center gap-2 text-[var(--ink-muted)] hover:text-gold transition-colors"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name ?? 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-card)]
                                  flex items-center justify-center text-gold
                                  border border-[var(--border)] text-xs font-serif">
                    {(user.display_name ?? 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{  opacity: 0, y: -8 }}
                    className="absolute right-0 top-10 w-48
                               bg-[var(--bg-card)] border border-[var(--border)]
                               shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50"
                  >
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-[0.78rem] text-cream truncate">
                        {user.display_name}
                      </p>
                      <p className="text-[0.65rem] text-[var(--ink-muted)]">
                        {user.is_admin ? 'Admin' : 'Reader'}
                      </p>
                    </div>
                    {user.is_admin && (
                      <Link
                        href={"/admin" as any}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5
                                   text-[0.75rem] text-[var(--ink-secondary)]
                                   hover:text-gold hover:bg-[var(--gold-faint)]
                                   transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href={"/bookmarks" as any}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5
                                 text-[0.75rem] text-[var(--ink-secondary)]
                                 hover:text-gold hover:bg-[var(--gold-faint)]
                                 transition-colors"
                    >
                      <Bookmark size={13} /> My Bookmarks
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5
                                 text-[0.75rem] text-[var(--ink-secondary)]
                                 hover:text-gold hover:bg-[var(--gold-faint)]
                                 transition-colors border-t border-[var(--border)]"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <Link
            href={"/auth" as any}
            className="flex items-center gap-1.5 text-[0.72rem] tracking-[0.1em] uppercase
                       text-[var(--ink-secondary)] hover:text-gold transition-colors"
          >
            <User size={14} /> Sign In
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[var(--ink-muted)] hover:text-gold transition-colors p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{  opacity: 0, height: 0 }}
            className="absolute top-16 left-0 right-0
                       bg-[rgba(12,10,8,0.98)] border-b border-[var(--border)]
                       md:hidden overflow-hidden"
          >
            <div className="flex flex-col py-4">
              {[
                { href: '/#featured',  label: 'Featured' },
                { href: '/#stories',   label: 'All Stories' },
                { href: '/#about',     label: 'About' },
                { href: '/#subscribe', label: 'Subscribe' },
                { href: '/auth',       label: 'Sign In' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setMenuOpen(false)}
                  className="px-8 py-3.5 text-[0.78rem] tracking-[0.12em] uppercase
                             text-[var(--ink-secondary)] hover:text-gold
                             hover:bg-[var(--gold-faint)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
