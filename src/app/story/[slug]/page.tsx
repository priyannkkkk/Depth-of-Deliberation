// src/app/story/[slug]/page.tsx — Server Component
import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { getStoryWithStats, getAllStorySlugs, getRelatedStories } from '@/lib/queries/stories'
import { getComments, getReactionCounts } from '@/lib/queries/interactions'
import { Nav }            from '@/components/layout/Nav'
import { Footer }         from '@/components/layout/Footer'
import { StoryReader }    from '@/components/reader/StoryReader'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { CursorGlow }     from '@/components/ui/CursorGlow'

interface PageProps {
  params: { slug: string }
}

// Generate static pages at build time for all published stories
export async function generateStaticParams() {
  const slugs = await getAllStorySlugs()
  return slugs.map((slug) => ({ slug }))
}

// Per-story metadata (SEO + OG)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const story = await getStoryWithStats(params.slug)
  if (!story) return { title: 'Story Not Found' }

  const description = story.excerpt ?? `${story.title} — ${story.lesson}`
  const ogImage     = story.cover_url ?? `/api/og?title=${encodeURIComponent(story.title)}&excerpt=${encodeURIComponent(description)}`

  return {
    title:       story.title,
    description,
    keywords:    [...story.tags, 'story', 'reflection', 'healing', 'overthinking'],
    openGraph: {
      type:        'article',
      title:       story.title,
      description,
      publishedTime: story.published_at ?? undefined,
      authors:     [story.author?.display_name ?? 'Priyank Pateliya'],
      tags:        story.tags,
      images:      [{ url: ogImage, width: 1200, height: 630, alt: story.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       story.title,
      description,
      images:      [ogImage],
    },
    alternates: {
      canonical: `/story/${story.slug}`,
    },
  }
}

// Revalidate each story page every 5 minutes
export const revalidate = 300

export default async function StoryPage({ params }: PageProps) {
  const story = await getStoryWithStats(params.slug)
  if (!story) notFound()

  // Parallel data fetch
  const [comments, reactionCounts, related] = await Promise.all([
    getComments(story.id),
    getReactionCounts(story.id),
    getRelatedStories(story.id, story.tags),
  ])

  // JSON-LD structured data
  const jsonLd = {
    '@context':         'https://schema.org',
    '@type':            'Article',
    headline:           story.title,
    description:        story.excerpt,
    author:             { '@type': 'Person', name: story.author?.display_name ?? 'Priyank Pateliya' },
    datePublished:      story.published_at,
    dateModified:       story.updated_at,
    keywords:           story.tags.join(', '),
    image:              story.cover_url,
    publisher: {
      '@type': 'Organization',
      name:    'Depths of Deliberation',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CursorGlow />
      <Nav />
      <StoryReader
        story={story}
        initialComments={comments}
        initialReactionCounts={reactionCounts}
        related={related}
      />
      <Footer />
      <ToastContainer />
    </>
  )
}
