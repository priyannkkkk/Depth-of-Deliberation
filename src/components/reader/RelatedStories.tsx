'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Story } from '@/types'

export function RelatedStories({ stories }: { stories: Story[] }) {
  return (
    <div className="site-width mx-auto px-6 md:px-16 py-16">
      <p className="section-label mb-3">Continue reading</p>
      <h2 className="font-serif font-light text-cream text-2xl mb-8">Related Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5px]">
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <Link href={`/story/${story.slug}`}>
              <div className="p-7 bg-[var(--bg-card)] border border-[var(--border)] group
                              hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]
                              hover:-translate-y-1 transition-all duration-400 cursor-pointer">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {story.tags.slice(0,2).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
                <h3 className="font-serif text-cream text-xl font-light mb-2
                               group-hover:text-gold transition-colors">{story.title}</h3>
                {story.excerpt && (
                  <p className="font-serif italic text-[var(--ink-secondary)] text-sm
                                line-clamp-2 leading-[1.75]">{story.excerpt}</p>
                )}
                <p className="text-[0.65rem] text-[var(--ink-muted)] mt-3">
                  ⏳ {story.read_time} min read
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
