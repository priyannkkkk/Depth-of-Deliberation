'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Hero() {
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return

    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div')
      p.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: #c4a35a;
        width: ${Math.random() > 0.6 ? 2 : 1.5}px;
        height: ${Math.random() > 0.6 ? 2 : 1.5}px;
        left: ${Math.random() * 100}%;
        animation: floatUp ${9 + Math.random() * 16}s linear ${-(Math.random() * 22)}s infinite;
        pointer-events: none;
      `
      container.appendChild(p)
    }
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center
                 text-center px-6 pt-36 pb-24 overflow-hidden"
      aria-label="Hero"
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 50% 60%, rgba(196,163,90,0.055) 0%, transparent 65%),
            radial-gradient(ellipse 35% 35% at 15% 25%, rgba(130,90,45,0.04) 0%, transparent 55%),
            radial-gradient(ellipse 35% 35% at 85% 75%, rgba(70,45,20,0.05) 0%, transparent 55%)
          `,
        }}
      />

      {/* Particles */}
      <div
        ref={particlesRef}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="section-label mb-6"
        >
          A Collection of Stories &amp; Reflections
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="font-serif font-light leading-[1.04] text-cream tracking-[-0.01em]"
          style={{ fontSize: 'clamp(3.8rem, 9vw, 7.5rem)' }}
        >
          Depths of{' '}
          <em className="italic text-gold not-italic" style={{ fontStyle: 'italic' }}>
            Deliberation
          </em>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="gold-divider"
          aria-hidden="true"
        />

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.65, ease: [0.23, 1, 0.32, 1] }}
          className="font-serif font-light italic text-[var(--ink-secondary)] max-w-[660px] mx-auto leading-[1.85]"
          style={{ fontSize: 'clamp(1.05rem, 2vw, 1.3rem)' }}
        >
          Personal insights woven through real-life emotions — exploring overthinking,
          healing, faith, loneliness, growth, and the quiet wisdom hidden inside ordinary moments.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-wrap gap-5 justify-center mt-12"
        >
          <Link href="#featured" className="btn-primary">
            Explore Stories
          </Link>
          <Link href="#subscribe" className="btn-ghost">
            Stay Connected
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-2
                   text-[var(--ink-muted)] text-[0.62rem] tracking-[0.22em] uppercase"
        aria-hidden="true"
      >
        <div
          className="w-px h-10 bg-gradient-to-b from-[var(--gold)] to-transparent"
          style={{ animation: 'pulseLine 2.2s ease-in-out infinite' }}
        />
        <span>Scroll</span>
      </motion.div>
    </section>
  )
}
