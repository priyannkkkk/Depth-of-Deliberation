'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, BookmarkCheck, Share2, ArrowUp, ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getSessionId, formatDate, copyToClipboard } from '@/lib/utils'
import {
  toggleReaction, setRating as saveRating,
  toggleBookmark, isBookmarked,
  trackView, saveReadingProgress,
  getUserReactions, getUserRating,
  addComment
} from '@/lib/queries/interactions'
import { CommentsSection } from './CommentsSection'
import { RelatedStories }  from './RelatedStories'
import { REACTION_LABELS } from '@/types'
import type { Story, Comment, ReactionCount, ReactionType } from '@/types'

interface StoryReaderProps {
  story:                Story
  initialComments:      Comment[]
  initialReactionCounts:ReactionCount[]
  related:              Story[]
}

export function StoryReader({
  story,
  initialComments,
  initialReactionCounts,
  related,
}: StoryReaderProps) {
  const { user, setReaderProgress, addToast } = useStore()

  // Reading progress
  const contentRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress]       = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)

  // Interactions
  const [reactions,   setReactions]   = useState<ReactionType[]>([])
  const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>(initialReactionCounts)
  const [userRating,  setUserRating]  = useState<number | null>(null)
  const [bookmarked,  setBookmarked]  = useState(false)
  const [hoverStar,   setHoverStar]   = useState(0)

  const sessionId = getSessionId()

  // Load user state
  useEffect(() => {
    async function loadState() {
      const [userRxns, userRtng, bkmkd] = await Promise.all([
        getUserReactions(story.id, user?.id, sessionId),
        getUserRating(story.id, user?.id, sessionId),
        user ? isBookmarked(story.id, user.id) : Promise.resolve(false),
      ])
      setReactions(userRxns)
      setUserRating(userRtng)
      setBookmarked(bkmkd)
    }
    loadState()

    // Track view
    trackView(story.id, sessionId, user?.id)
  }, [story.id, user, sessionId])

  // Reading progress scroll tracking
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const onScroll = () => {
      const scrollTop    = window.scrollY
      const docHeight    = document.documentElement.scrollHeight - window.innerHeight
      const pct          = Math.min(Math.round((scrollTop / docHeight) * 100), 100)
      setProgress(pct)
      setReaderProgress(pct)
      setShowBackTop(scrollTop > 600)

      // Save progress to DB every 10%
      if (user && pct % 10 === 0) {
        saveReadingProgress(user.id, story.id, pct)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [user, story.id, setReaderProgress])

  // Handle reaction toggle
  const handleReaction = useCallback(async (reaction: ReactionType) => {
    const wasActive = reactions.includes(reaction)
    // Optimistic update
    setReactions((prev) =>
      wasActive ? prev.filter((r) => r !== reaction) : [...prev, reaction]
    )
    setReactionCounts((prev) => {
      const existing = prev.find((r) => r.reaction === reaction)
      if (existing) {
        return prev.map((r) =>
          r.reaction === reaction
            ? { ...r, count: wasActive ? Math.max(0, r.count - 1) : r.count + 1 }
            : r
        )
      }
      return [...prev, { story_id: story.id, reaction, count: 1 }]
    })

    try {
      await toggleReaction(story.id, reaction, user?.id, sessionId)
    } catch {
      // Rollback
      setReactions((prev) =>
        wasActive ? [...prev, reaction] : prev.filter((r) => r !== reaction)
      )
      addToast('Could not save reaction', 'error')
    }
  }, [reactions, story.id, user, sessionId, addToast])

  // Handle rating
  const handleRating = useCallback(async (stars: number) => {
    const prev = userRating
    setUserRating(stars)
    try {
      await saveRating(story.id, stars, user?.id, sessionId)
      addToast(`Rated ${stars} star${stars > 1 ? 's' : ''} — thank you ✦`)
    } catch {
      setUserRating(prev)
      addToast('Could not save rating', 'error')
    }
  }, [userRating, story.id, user, sessionId, addToast])

  // Handle bookmark
  const handleBookmark = useCallback(async () => {
    if (!user) { addToast('Sign in to bookmark stories'); return }
    const prev = bookmarked
    setBookmarked(!prev)
    try {
      const result = await toggleBookmark(story.id, user.id)
      setBookmarked(result)
      addToast(result ? 'Story bookmarked ✦' : 'Bookmark removed')
    } catch {
      setBookmarked(prev)
      addToast('Could not save bookmark', 'error')
    }
  }, [bookmarked, story.id, user, addToast])

  // Handle share
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/story/${story.slug}`
    if (navigator.share) {
      await navigator.share({ title: story.title, url })
    } else {
      const ok = await copyToClipboard(url)
      addToast(ok ? 'Link copied ✦' : 'Could not copy link')
    }
  }, [story.slug, story.title, addToast])

  const getCount = (r: ReactionType) =>
    reactionCounts.find((rc) => rc.reaction === r)?.count ?? 0

  return (
    <>
      {/* Progress bar */}
      <div
        className="progress-bar"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <main className="pt-24 pb-0">
        {/* ── Story header ──────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
          className="reading-width mx-auto px-6 pt-12 pb-12 text-center
                     border-b border-[var(--border)]"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {story.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${tag}`}>
                <span className="tag hover:border-[var(--gold-dim)] hover:text-gold
                                 transition-colors duration-200 cursor-pointer">
                  {tag}
                </span>
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1
            className="font-serif font-light text-cream leading-[1.08] mb-4"
            style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
          >
            {story.title}
          </h1>

          {/* Lesson */}
          {story.lesson && (
            <p className="font-serif italic text-gold text-lg mb-6">
              {story.lesson}
            </p>
          )}

          {/* Meta */}
          <div className="flex gap-8 justify-center items-center
                          text-[0.68rem] tracking-[0.12em] uppercase text-[var(--ink-muted)]">
            {story.published_at && (
              <span>{formatDate(story.published_at)}</span>
            )}
            <span>⏳ {story.read_time} min read</span>
            {story.stats && (
              <span>{story.stats.view_count.toLocaleString()} reads</span>
            )}
          </div>
        </motion.header>

        {/* ── Body ─────────────────────────────────── */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="reading-width mx-auto px-6 py-14"
        >
          {/* Story text */}
          <div
            className="story-body drop-cap"
            dangerouslySetInnerHTML={{ __html: story.body_html }}
          />

          {/* Reflection */}
          <div className="reflection-block mt-16">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">
              Reflection
            </p>
            <p className="font-serif italic text-[var(--ink-secondary)] text-[1.08rem] leading-[1.95]">
              {story.reflection}
            </p>
          </div>

          {/* ── Action bar ────────────────────────── */}
          <div className="flex flex-wrap gap-3 justify-center my-12">
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-5 py-2.5 text-[0.72rem]
                          tracking-[0.1em] uppercase border transition-all duration-300
                          ${bookmarked
                            ? 'bg-[var(--gold-faint)] text-gold border-[var(--gold-dim)]'
                            : 'bg-transparent text-[var(--ink-secondary)] border-[var(--border)] hover:text-gold hover:border-[var(--gold-dim)] hover:bg-[var(--gold-faint)]'
                          }`}
            >
              {bookmarked
                ? <><BookmarkCheck size={13} /> Bookmarked</>
                : <><Bookmark size={13} /> Bookmark</>
              }
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 text-[0.72rem]
                         tracking-[0.1em] uppercase border border-[var(--border)]
                         text-[var(--ink-secondary)] hover:text-gold hover:border-[var(--gold-dim)]
                         hover:bg-[var(--gold-faint)] transition-all duration-300"
            >
              <Share2 size={13} /> Share
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 px-5 py-2.5 text-[0.72rem]
                         tracking-[0.1em] uppercase border border-[var(--border)]
                         text-[var(--ink-secondary)] hover:text-gold hover:border-[var(--gold-dim)]
                         hover:bg-[var(--gold-faint)] transition-all duration-300"
            >
              <ArrowUp size={13} /> Back to top
            </button>
          </div>

          {/* ── Reactions ─────────────────────────── */}
          <div className="mt-16 pt-12 border-t border-[var(--border)]">
            <p className="font-serif text-cream text-[1.35rem] font-light text-center mb-2">
              What did this story make you feel?
            </p>
            <p className="font-serif italic text-[var(--ink-muted)] text-sm text-center mb-8">
              Choose everything that resonated with you.
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center">
              {(Object.keys(REACTION_LABELS) as ReactionType[]).map((reaction) => {
                const { label, emoji } = REACTION_LABELS[reaction]
                const active = reactions.includes(reaction)
                const count  = getCount(reaction)

                return (
                  <motion.button
                    key={reaction}
                    onClick={() => handleReaction(reaction)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-5 py-2.5
                                text-[0.73rem] border transition-all duration-300
                                ${active
                                  ? 'bg-[var(--gold-faint)] text-gold border-[var(--gold-dim)]'
                                  : 'bg-transparent text-[var(--ink-secondary)] border-[var(--border)] hover:text-gold hover:border-[var(--gold-dim)] hover:bg-[var(--gold-faint)]'
                                }`}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                    {count > 0 && (
                      <span className="text-[0.6rem] text-[var(--ink-muted)]">
                        {count}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── Rating ────────────────────────────── */}
          <div className="mt-12 text-center">
            <p className="font-serif text-cream text-lg font-light mb-1">Rate this story</p>
            <p className="text-[0.7rem] text-[var(--ink-muted)] mb-4">
              {userRating ? `You rated this ${userRating} star${userRating > 1 ? 's' : ''}` : 'Tap a star to rate'}
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleRating(n)}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  aria-label={`Rate ${n} stars`}
                  className={`text-2xl transition-all duration-200
                              ${(hoverStar || userRating || 0) >= n
                                ? 'text-gold scale-110'
                                : 'text-[var(--ink-muted)]'
                              }`}
                >
                  ★
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Comments ─────────────────────────────── */}
        <div className="reading-width mx-auto px-6 pb-16 border-t border-[var(--border)]">
          <CommentsSection
            storyId={story.id}
            initialComments={initialComments}
          />
        </div>

        {/* ── Related stories ──────────────────────── */}
        {related.length > 0 && (
          <div className="border-t border-[var(--border)] bg-[var(--bg-dark)]">
            <RelatedStories stories={related} />
          </div>
        )}
      </main>

      {/* Floating back-to-top */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{  opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-10 h-10
                       bg-[var(--bg-card)] border border-[var(--border)]
                       flex items-center justify-center
                       text-[var(--ink-secondary)] hover:text-gold hover:border-[var(--gold-dim)]
                       transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
