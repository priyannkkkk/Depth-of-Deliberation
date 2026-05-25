import Link from 'next/link'
import { adminGetStories } from '@/lib/queries/stories'
import { formatDate } from '@/lib/utils'
import { PenLine, Plus, Eye, EyeOff, Archive } from 'lucide-react'

export default async function AdminStoriesPage() {
  const stories = await adminGetStories()
  const statusColors = { published:'text-green-400', draft:'text-gold', archived:'text-[var(--ink-muted)]' }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-cream text-3xl font-light">Stories</h1>
        <Link href="/admin/stories/new" className="btn-primary py-2.5 px-5 text-xs">
          <Plus size={13}/> New Story
        </Link>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)]">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-px bg-[var(--border)]">
          {/* Header */}
          {['Story','Status','Published','Actions'].map(h => (
            <div key={h} className="bg-[var(--bg-card)] px-5 py-3
                                    text-[0.62rem] tracking-[0.15em] uppercase text-[var(--ink-muted)]">
              {h}
            </div>
          ))}
          {/* Rows */}
          {stories.map(story => (
            <>
              <div key={`t-${story.id}`} className="bg-[var(--bg-card)] px-5 py-4">
                <p className="text-cream text-sm">{story.title}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {story.tags.slice(0,3).map(t => <span key={t} className="tag text-[0.52rem]">{t}</span>)}
                </div>
              </div>
              <div key={`s-${story.id}`} className="bg-[var(--bg-card)] px-5 py-4 flex items-center">
                <span className={`text-[0.72rem] uppercase tracking-wider ${statusColors[story.status as keyof typeof statusColors]}`}>
                  {story.status}
                </span>
              </div>
              <div key={`d-${story.id}`} className="bg-[var(--bg-card)] px-5 py-4 flex items-center">
                <span className="text-[var(--ink-muted)] text-xs">
                  {story.published_at ? formatDate(story.published_at) : '—'}
                </span>
              </div>
              <div key={`a-${story.id}`} className="bg-[var(--bg-card)] px-5 py-4 flex items-center gap-3">
                <Link href={`/admin/stories/${story.id}/edit`}
                  className="text-[var(--ink-muted)] hover:text-gold transition-colors" title="Edit">
                  <PenLine size={14}/>
                </Link>
                <Link href={`/story/${story.slug}`} target="_blank"
                  className="text-[var(--ink-muted)] hover:text-gold transition-colors" title="View">
                  <Eye size={14}/>
                </Link>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
