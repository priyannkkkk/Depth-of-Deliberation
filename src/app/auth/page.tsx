'use client'
// src/app/auth/page.tsx
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Chrome, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase'

type AuthMode = 'signin' | 'signup' | 'magic'

export default function AuthPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') ?? '/'

  const [mode,     setMode]     = useState<AuthMode>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [message,  setMessage]  = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const supabase = createBrowserSupabase()

  async function handleGoogleSignIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
    if (error) setMessage({ text: error.message, type: 'error' })
    setLoading(false)
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
        })
        if (error) throw error
        setMessage({ text: 'Check your email for a magic link ✦', type: 'success' })
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
        })
        if (error) throw error
        setMessage({ text: 'Account created — check your email to confirm ✦', type: 'success' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(next)
        router.refresh()
      }
    } catch (err) {
      setMessage({ text: (err as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    px-6 py-16 relative overflow-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,163,90,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 30% 40% at 20% 30%, rgba(100,70,30,0.03) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--ink-muted)] hover:text-gold
                     text-[0.7rem] tracking-[0.14em] uppercase mb-10 transition-colors"
        >
          <ArrowLeft size={12} /> Back to Stories
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8"
        >
          <p className="section-label mb-3">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </p>
          <h1 className="font-serif font-light text-cream text-3xl leading-tight">
            {mode === 'magic'
              ? 'Sign in with\na magic link'
              : mode === 'signup'
              ? 'Join the\nquiet corner'
              : 'Continue\nyour journey'
            }
          </h1>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 p-4 text-sm border
                        ${message.type === 'error'
                          ? 'bg-red-900/20 border-red-800/40 text-red-300'
                          : 'bg-[var(--gold-faint)] border-[var(--gold-dim)] text-gold'
                        }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Google */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3
                     py-3.5 mb-4
                     border border-[var(--border)] bg-[var(--bg-card)]
                     text-[var(--ink-secondary)] hover:text-gold hover:border-[var(--gold-dim)]
                     hover:bg-[var(--bg-card-hover)]
                     text-[0.75rem] tracking-[0.1em] uppercase
                     transition-all duration-300 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[0.65rem] text-[var(--ink-muted)] tracking-wider uppercase">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Email form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          onSubmit={handleEmailAuth}
          className="flex flex-col gap-3"
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            autoComplete="email"
          />

          {mode !== 'magic' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="input"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-1 disabled:opacity-50"
          >
            <Mail size={14} />
            {loading
              ? 'Please wait…'
              : mode === 'magic'
              ? 'Send Magic Link'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'
            }
          </button>
        </motion.form>

        {/* Mode switchers */}
        <div className="flex flex-col gap-2.5 mt-6">
          {mode !== 'magic' && (
            <button
              onClick={() => { setMode('magic'); setMessage(null) }}
              className="text-[0.7rem] text-[var(--ink-muted)] hover:text-gold
                         tracking-[0.1em] uppercase transition-colors"
            >
              Use magic link instead →
            </button>
          )}
          {mode === 'signin' && (
            <button
              onClick={() => { setMode('signup'); setMessage(null) }}
              className="text-[0.7rem] text-[var(--ink-muted)] hover:text-gold
                         tracking-[0.1em] uppercase transition-colors"
            >
              No account? Create one →
            </button>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => { setMode('signin'); setMessage(null) }}
              className="text-[0.7rem] text-[var(--ink-muted)] hover:text-gold
                         tracking-[0.1em] uppercase transition-colors"
            >
              Already have an account? Sign in →
            </button>
          )}
          {mode === 'magic' && (
            <button
              onClick={() => { setMode('signin'); setMessage(null) }}
              className="text-[0.7rem] text-[var(--ink-muted)] hover:text-gold
                         tracking-[0.1em] uppercase transition-colors"
            >
              Use password instead →
            </button>
          )}
        </div>

        {/* Guest note */}
        <p className="mt-8 text-center font-serif italic text-[var(--ink-muted)] text-[0.8rem]">
          You can always read as a guest.{' '}
          <Link href="/" className="text-gold hover:underline underline-offset-2">
            Browse stories →
          </Link>
        </p>
      </div>
    </div>
  )
}
