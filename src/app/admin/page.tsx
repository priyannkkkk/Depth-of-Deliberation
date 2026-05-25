// src/app/admin/page.tsx — Server Component
import { createAdminSupabase } from '@/lib/supabase'
import { BarChart3, BookOpen, Eye, Users, MessageCircle, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createAdminSupabase()

  const [
    { count: totalStories },
    { count: publishedStories },
    { count: totalSubscribers },
    { count: totalComments },
    { data: topStories },
    { data: recentViews },
  ] = await Promise.all([
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('confirmed', true),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('story_stats').select('*').order('view_count', { ascending: false }).limit(5),
    supabase.from('story_views')
      .select('viewed_at')
      .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const stats = [
    { label: 'Published Stories', value: publishedStories ?? 0, icon: BookOpen,       color: 'text-gold' },
    { label: 'Total Reads',       value: (recentViews?.length ?? 0) + 'this month',
                                             icon: Eye,           color: 'text-green-400' },
    { label: 'Subscribers',       value: totalSubscribers ?? 0,  icon: Users,          color: 'text-blue-400' },
    { label: 'Comments',          value: totalComments ?? 0,     icon: MessageCircle,  color: 'text-purple-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-cream text-3xl font-light mb-1">Dashboard</h1>
        <p className="text-[var(--ink-muted)] text-sm">
          {totalStories ?? 0} total stories · {publishedStories ?? 0} published
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--bg-card)] border border-[var(--border)] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[var(--ink-muted)]">
                {stat.label}
              </span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className={`font-serif text-3xl font-light ${stat.color}`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top stories */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-gold" />
          <h2 className="font-serif text-cream text-lg font-light">Top Stories</h2>
        </div>

        <div className="flex flex-col divide-y divide-[var(--border)]">
          {(topStories ?? []).map((story: {
            id: string, title: string, view_count: number,
            comment_count: number, avg_rating: number | null
          }, i) => (
            <div key={story.id} className="flex items-center gap-4 py-3">
              <span className="font-serif text-2xl text-[var(--ink-muted)] font-light w-6">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm truncate">{story.title}</p>
                <p className="text-[var(--ink-muted)] text-[0.65rem] mt-0.5">
                  {story.view_count.toLocaleString()} reads ·{' '}
                  {story.comment_count} comments
                  {story.avg_rating && ` · ★ ${story.avg_rating}`}
                </p>
              </div>
              <BarChart3 size={14} className="text-[var(--ink-muted)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
