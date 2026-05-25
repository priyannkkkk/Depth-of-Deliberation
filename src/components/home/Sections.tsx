'use client'
// ═══════════════════════════════════════════════
// Home Sections: About, Subscribe, Contact, Footer
// ═══════════════════════════════════════════════
import { useRef, useState } from 'react'
import { motion, useInView }from 'framer-motion'
import { subscribe }        from '@/lib/queries/interactions'
import { useStore }         from '@/lib/store'

/* ── About ───────────────────────────────────── */
export function AboutSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div
      ref={ref}
      className="bg-[var(--bg-dark)] border-t border-b border-[var(--border)]
                 py-28 px-6 md:px-16"
    >
      <div
        className="site-width mx-auto grid gap-16 md:gap-24 items-center"
        style={{ gridTemplateColumns: 'minmax(0, 260px) 1fr' }}
      >
        {/* Portrait */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
        >
          <div
            className="border border-[var(--border)] bg-[var(--bg-card)]
                       flex items-center justify-center relative overflow-hidden"
            style={{ aspectRatio: '3/4' }}
          >
            <span
              className="font-serif font-light text-[8rem] text-[var(--gold-faint)]"
              aria-hidden="true"
            >
              P
            </span>
            {/* Bottom fade */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, transparent 50%)' }}
              aria-hidden="true"
            />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="section-label text-gold mb-3">About the author</p>
          <h2
            className="font-serif font-light text-cream leading-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Priyank<br />Pateliya
          </h2>

          <p className="font-serif font-light text-[var(--ink-secondary)] text-[1.1rem] leading-[2] mb-4">
            I write about the thoughts people usually hide. The quiet fears, the healing,
            the overthinking, the loneliness, the faith, and the moments that silently change us.
          </p>

          <p className="font-serif font-light text-[var(--ink-secondary)] text-[1.1rem] leading-[2]">
            Depths of Deliberation is not just a collection of stories — it is a reflection
            of emotional battles, unanswered questions, inner growth, and the search for
            peace within ourselves.
          </p>

          <div
            className="mt-8 pl-5 border-l-2 border-[var(--gold-faint)]
                       font-serif italic text-gold text-[1.2rem] leading-[1.75]"
          >
            "Every story here was lived before it was written."
          </div>
        </motion.div>
      </div>

      {/* Responsive mobile */}
      <style jsx>{`
        @media (max-width: 700px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ── Subscribe ───────────────────────────────── */
export function SubscribeSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { addToast } = useStore()

  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await subscribe(email, name || undefined)
      addToast('Check your inbox to confirm ✦')
      setEmail('')
      setName('')
    } catch {
      addToast('Could not subscribe — please try again', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-28 px-6 text-center">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-[560px] mx-auto"
      >
        <p className="section-label mb-3">Stay connected</p>
        <h2
          className="font-serif font-light text-cream leading-tight mb-6"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          New Stories,<br />
          <em className="italic text-gold">When They Arrive</em>
        </h2>

        <p className="font-serif italic text-[var(--ink-secondary)] text-[1.05rem] leading-[1.9] mb-8">
          Some thoughts are too deep to stay unwritten.<br />
          Subscribe to receive new reflections whenever another piece of my mind finds words.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input text-center"
          />
          <div className="flex border border-[var(--border-hover)] overflow-hidden">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-5 py-3.5 bg-[var(--bg-card)] border-none
                         text-[var(--ink-primary)] font-sans text-sm outline-none
                         placeholder:text-[var(--ink-muted)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 bg-gold text-[var(--bg-deep)]
                         font-sans text-[0.72rem] font-semibold tracking-widest uppercase
                         border-none cursor-pointer whitespace-nowrap
                         hover:bg-[var(--cream)] transition-colors duration-300
                         disabled:opacity-50"
            >
              {loading ? '…' : 'Subscribe'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-[0.7rem] font-serif italic text-[var(--ink-muted)]">
          No noise. Only stories. Unsubscribe whenever you like.
        </p>
      </motion.div>
    </div>
  )
}

/* ── Contact ─────────────────────────────────── */
export function ContactSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { addToast } = useStore()

  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      addToast('Message sent — thank you for reaching out ✦')
      setForm({ name: '', email: '', message: '' })
    } catch {
      addToast('Could not send message — please email directly', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="bg-[var(--bg-dark)] border-t border-[var(--border)]
                 py-24 px-6 md:px-16"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-[640px] mx-auto text-center"
      >
        <p className="section-label mb-3">Reach out</p>
        <h2
          className="font-serif font-light text-cream leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Let's Speak
        </h2>

        <a
          href="mailto:priyankpateliya2004@gmail.com"
          className="inline-block font-serif text-gold text-lg hover:underline
                     underline-offset-4 mb-8 transition-colors"
        >
          priyankpateliya2004@gmail.com
        </a>

        <form onSubmit={handleSubmit} className="text-left flex flex-col gap-3">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="input"
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            className="input"
          />
          <textarea
            placeholder="Your message…"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={5}
            required
            className="input resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary self-end disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
