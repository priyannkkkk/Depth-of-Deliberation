'use client'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import type { Story } from '@/types'
import { cn } from '@/lib/utils'

interface FeaturedGridProps {
  stories: Story[]
}

export function FeaturedGrid({ stories }: FeaturedGridProps) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const large   = stories.find((s) => s.featured_size === 'large')
  const medium  = stories.find((s) => s.featured_size === 'medium')
  const medium2 = stories.find((s) => s.featured_size === 'medium2')

  return (
    <div
      className="site-width mx-auto px-6 md:px-16 py-24"
      ref={ref}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mb-16"
      >
        <p className="section-label mb-3">Start here</p>
        <h2
          className="font-serif font-light text-cream leading-[1.15]"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
        >
          Three Stories Worth
          <br />
          <em className="italic text-gold">Reading First</em>
        </h2>
        <p className="font-serif italic text-[var(--ink-muted)] mt-4 text-base">
          These are the ones that stay with you longest.
        </p>
      </motion.div>

      {/* Grid — large left, two stacked right */}
      <div
        className="grid gap-[1.5px]"
        style={{
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'auto auto',
        }}
      >
        {large && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            style={{ gridColumn: '1', gridRow: '1 / 3' }}
          >
            <FeaturedCard story={large} size="large" />
          </motion.div>
        )}

        {medium && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ gridColumn: '2', gridRow: '1' }}
          >
            <FeaturedCard story={medium} size="medium" />
          </motion.div>
        )}

        {medium2 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ gridColumn: '2', gridRow: '2' }}
          >
            <FeaturedCard story={medium2} size="medium2" />
          </motion.div>
        )}
      </div>

      {/* Responsive: single column on mobile */}
      <style jsx>{`
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridColumn: '1'"],
          div[style*="gridColumn: '2'"] {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ── Individual featured card ─────────────────── */
function FeaturedCard({
  story,
  size,
}: {
  story: Story
  size: 'large' | 'medium' | 'medium2'
}) {
  const isLarge = size === 'large'

  return (
    <Link href={`/story/${story.slug}`} className="block h-full">
      <div
        className="relative overflow-hidden h-full cursor-pointer group
                   border border-[var(--border)] transition-all duration-500
                   hover:border-[var(--border-hover)]
                   hover:shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
      >
        {/* Background */}
        {story.cover_url ? (
          <div className="relative w-full" style={{ aspectRatio: isLarge ? '3/4' : '16/9' }}>
            <Image
              src={story.cover_url}
              alt={story.title}
              fill
              className="object-cover filter brightness-[0.45] saturate-[0.6]
                         transition-all duration-700
                         group-hover:brightness-[0.55] group-hover:saturate-[0.7] group-hover:scale-[1.03]"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div
            className="w-full relative overflow-hidden"
            style={{
              aspectRatio:     isLarge ? '3/4' : '16/9',
              background:      `linear-gradient(135deg, ${story.accent_color ?? '#1a1208'}, #0d0b08)`,
              transition:      'filter 0.4s',
            }}
          >
            {/* Giant ghost number */}
            <span
              className="absolute right-[-0.05em] bottom-[-0.1em]
                         font-serif font-light leading-none
                         pointer-events-none select-none
                         text-[var(--gold)] opacity-[0.05]
                         transition-opacity duration-500
                         group-hover:opacity-[0.08]"
              style={{ fontSize: isLarge ? '8rem' : '5rem' }}
              aria-hidden="true"
            >
              DOD
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(12,10,8,0.95) 0%, rgba(12,10,8,0.35) 55%, transparent 100%)',
          }}
          aria-hidden="true"
        />

       {/* Content */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-[2]',
            isLarge ? 'p-8 md:p-10' : 'p-6 md:p-8'
          )}
        >
          {/* Title */}
          <h3
            className={cn(
              'font-serif font-light text-cream leading-[1.15] mb-6',
              isLarge
                ? 'text-5xl md:text-6xl'
                : 'text-3xl md:text-4xl'
            )}
          >
            {story.title}
          </h3>
        
          {/* Footer */}
          <div className="flex justify-end">
            <span
              className="text-[0.72rem] tracking-[0.14em] uppercase text-gold
                         flex items-center gap-2
                         transition-all duration-300
                         group-hover:gap-3"
            >
              Read Story →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
