'use client'
import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import type { Story } from '@/types'
import { createBrowserSupabase } from '@/lib/supabase'

interface MoreStoriesProps {
  initialStories: Story[]
}

export function MoreStories({ initialStories }: MoreStoriesProps) {
  const ref          = useRef<HTMLDivElement>(null)
  const inView       = useInView(ref, { once: true, margin: '-60px' })
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [page,    setPage]    = useState(1)
  const [hasMore,  setHasMore] = useState(initialStories.length === 9)
  const [loading,  setLoading] = useState(false)

  const loadMore = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createBrowserSupabase()
      const nextPage = page + 1
      const pageSize = 9
      const from     = (nextPage - 1) * pageSize

      const { data, count } = await supabase
        .from('stories')
        .select('id,slug,title,lesson,excerpt,tags,read_time,cover_url,accent_color,published_at,view_count', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, from + pageSize - 1)

      if (data) {
        setStories((prev) => [...prev, ...data as Story[]])
        setPage(nextPage)
        setHasMore((count ?? 0) > from + pageSize)
      }
    } finally {
      setLoading(false)
    }
  }, [page, loading])

  return (
    <div
      className="site-width mx-auto px-6 md:px-16 pb-28"
      ref={ref}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-end justify-between flex-wrap gap-6 mb-8"
      >
        <div>
          <p className="section-label mb-2">All reflections</p>
          <h2
            className="font-serif font-light text-cream leading-[1.15]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            More{' '}
            <em className="italic text-gold">Stories</em>
          </h2>
        </div>
        <p className="font-serif italic text-[var(--ink-muted)] text-sm max-w-[300px] text-right leading-[1.8]">
          Each one lives independently.<br />
          There is no wrong place to begin.
        </p>
      </motion.div>

      {/* Separator */}
      <div className="w-full h-px bg-[var(--border)] mb-10" aria-hidden="true" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1.5px]">
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay:    Math.min(i * 0.05, 0.4),
              ease:     [0.23, 1, 0.32, 1],
            }}
          >
            <StoryCard story={story} />
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-14">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : 'Load More Stories'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Single compact story card ─────────────────── */
function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/story/${story.slug}`} className="block h-full">
      <article
        className="relative h-full p-8 md:p-9
                   bg-[var(--bg-card)] border border-[var(--border)]
                   cursor-pointer group overflow-hidden
                   transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)]
                   hover:bg-[var(--bg-card-hover)]
                   hover:border-[var(--border-hover)]
                   hover:-translate-y-1
                   hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
      >
        {/* Subtle inner glow on hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500
                     group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(196,163,90,0.03), transparent)',
          }}
          aria-hidden="true"
        />

        {/* Ghost number */}
        <span
          className="absolute top-5 right-6 font-serif font-light text-5xl
                     text-[var(--ink-muted)] leading-none select-none
                     transition-colors duration-300 group-hover:text-[var(--gold-faint)]"
          aria-hidden="true"
        >
          {String(story.id).padStart(2, '0')}
        </span>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {story.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-serif font-light text-cream text-[1.35rem] leading-[1.25] mb-2">
          {story.title}
        </h3>

        {/* Lesson */}
        {story.lesson && (
          <p className="text-[0.66rem] tracking-[0.08em] uppercase text-gold opacity-80 mb-3">
            {story.lesson}
          </p>
        )}

        {/* Excerpt */}
        <p className="font-serif italic text-[var(--ink-secondary)] text-[0.92rem]
                      leading-[1.78] mb-5 line-clamp-3">
          {story.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between
                        border-t border-[var(--border)] pt-4 mt-auto">
          <span className="text-[0.66rem] text-[var(--ink-muted)]">
            ⏳ {story.read_time} min read
          </span>
          <span
            className="text-[0.66rem] tracking-[0.14em] uppercase text-gold
                       flex items-center gap-1.5
                       transition-[gap] duration-300
                       group-hover:gap-3"
          >
            Read Story →
          </span>
        </div>
      </article>
    </Link>
  )
}
