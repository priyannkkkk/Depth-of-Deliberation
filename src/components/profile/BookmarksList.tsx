'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark as BookmarkIcon, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { getUserBookmarks, removeBookmark } from '@/lib/queries/interactions'
import type { Bookmark } from '@/types'

export function BookmarksList() {
  const { user, addToast } = useStore()
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getUserBookmarks(user.id).then(setBookmarks)
  }, [user])

  async function handleRemove(storyId: string, bookmarkId: string) {
    if (!user) return
    setRemovingId(bookmarkId)
    try {
      await removeBookmark(storyId, user.id)
      setBookmarks((prev) => prev?.filter((b) => b.id !== bookmarkId) ?? null)
      addToast('Bookmark removed')
    } catch {
      addToast('Could not remove bookmark', 'error')
    } finally {
      setRemovingId(null)
    }
  }

  if (!user || bookmarks === null) {
    return (
      <p className="text-center font-serif italic text-[var(--ink-muted)] py-16">
        Loading your saved stories…
      </p>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <BookmarkIcon size={22} className="mx-auto mb-4 text-[var(--ink-muted)]" />
        <p className="font-serif italic text-[var(--ink-muted)] mb-6">
          You haven&apos;t saved any stories yet.
        </p>
        <Link href="/#stories" className="btn-ghost">
          Browse Stories
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {bookmarks.map((bookmark) => {
        const story = bookmark.story
        if (!story) return null

        return (
          <div
            key={bookmark.id}
            className="flex items-center gap-5 p-4
                       bg-[var(--bg-card)] border border-[var(--border)]
                       hover:border-[var(--border-hover)] transition-colors duration-300"
          >
            {/* Cover */}
            <Link href={`/story/${story.slug}`} className="flex-shrink-0">
              <div
                className="w-16 h-16 overflow-hidden bg-[var(--bg-dark)]"
                style={
                  !story.cover_url
                    ? { background: `linear-gradient(135deg, ${story.accent_color ?? '#1a1208'}, #0d0b08)` }
                    : undefined
                }
              >
                {story.cover_url && (
                  <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/story/${story.slug}`}>
                <h3 className="font-serif font-light text-cream text-[1.05rem] leading-tight truncate hover:text-gold transition-colors">
                  {story.title}
                </h3>
              </Link>
              <p className="text-[0.66rem] text-[var(--ink-muted)] mt-1.5">
                ⏳ {story.read_time} min read
              </p>
            </div>

            {/* Remove */}
            <button
              onClick={() => handleRemove(story.id, bookmark.id)}
              disabled={removingId === bookmark.id}
              aria-label="Remove bookmark"
              className="flex-shrink-0 text-[var(--ink-muted)] hover:text-red-400
                         transition-colors disabled:opacity-40"
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
