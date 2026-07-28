// src/app/profile/continue-reading/page.tsx — Server Component
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { getContinueReading } from '@/lib/queries/interactions'

export const metadata: Metadata = {
  title: 'Continue Reading',
}

export default async function ContinueReadingPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?next=/profile/continue-reading')

  const inProgress = await getContinueReading(session.user.id)

  if (inProgress.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen size={22} className="mx-auto mb-4 text-[var(--ink-muted)]" />
        <p className="font-serif italic text-[var(--ink-muted)] mb-6">
          You don&apos;t have any stories in progress right now.
        </p>
        <Link href="/#stories" className="btn-ghost">
          Browse Stories
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {inProgress.map((entry) => {
        const story = entry.story
        if (!story) return null

        return (
          <div
            key={`${entry.user_id}-${entry.story_id}`}
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

            {/* Info + progress */}
            <div className="flex-1 min-w-0">
              <Link href={`/story/${story.slug}`}>
                <h3 className="font-serif font-light text-cream text-[1.05rem] leading-tight truncate hover:text-gold transition-colors">
                  {story.title}
                </h3>
              </Link>

              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex-1 h-[3px] bg-[var(--border)] max-w-[160px]">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-gold"
                    style={{ width: `${entry.progress_pct}%` }}
                  />
                </div>
                <span className="text-[0.64rem] text-[var(--ink-muted)] flex-shrink-0">
                  {entry.progress_pct}% read
                </span>
              </div>
            </div>

            {/* Continue button */}
            <Link
              href={`/story/${story.slug}`}
              className="flex-shrink-0 btn-ghost py-2 px-4 text-[0.66rem]"
            >
              Continue Reading
            </Link>
          </div>
        )
      })}
    </div>
  )
}
