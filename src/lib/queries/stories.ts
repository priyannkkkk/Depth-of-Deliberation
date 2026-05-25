// ═══════════════════════════════════════════════
// Story Queries — all DB operations for stories
// ═══════════════════════════════════════════════

import { createServerSupabase, createAdminSupabase } from '@/lib/supabase'
import type { Story, StoryFormData, PaginatedResponse } from '@/types'

// ── Fetch published stories (with pagination) ──
export async function getStories(opts: {
  page?: number
  pageSize?: number
  tag?: string
  search?: string
  featured?: boolean
} = {}): Promise<PaginatedResponse<Story>> {
  const { page = 1, pageSize = 12, tag, search, featured } = opts

  const supabase = await createServerSupabase()
  const from = (page - 1) * pageSize

  let query = supabase
    .from('stories')
    .select(
      '*, author:profiles!stories_author_id_fkey(id,display_name,avatar_url)',
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (tag) query = query.contains('tags', [tag])
  if (featured !== undefined) query = query.eq('featured', featured)
  if (search) query = query.textSearch('title', search, { type: 'websearch' })

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data as Story[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > from + pageSize,
  }
}

// ── Fetch featured stories ordered by featured_order ──
export async function getFeaturedStories(): Promise<Story[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stories')
    .select(
      '*, author:profiles!stories_author_id_fkey(id,display_name,avatar_url)'
    )
    .eq('status', 'published')
    .eq('featured', true)
    .order('featured_order', { ascending: true })
    .limit(3)

  if (error) throw error

  return (data as Story[]) ?? []
}

// ── Fetch single story by slug ──
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stories')
    .select(
      '*, author:profiles!stories_author_id_fkey(id,display_name,avatar_url)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null

  return data as Story
}

// ── Fetch story with full stats ──
export async function getStoryWithStats(slug: string): Promise<Story | null> {
  const supabase = await createServerSupabase()

  const [storyRes, statsRes, reactionsRes] = await Promise.all([
    supabase
      .from('stories')
      .select(
        '*, author:profiles!stories_author_id_fkey(id,display_name,avatar_url)'
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .single(),

    supabase
      .from('story_stats')
      .select('*')
      .eq('slug', slug)
      .single(),

    supabase
      .from('reaction_counts')
      .select('*')
      .eq('story_id', supabase.from('stories').select('id').eq('slug', slug)),
  ])

  if (storyRes.error) return null

  return {
    ...storyRes.data,
    stats: statsRes.data ?? undefined,
    reaction_counts: reactionsRes.data ?? [],
  } as Story
}

// ── Fetch related stories (same tags) ──
export async function getRelatedStories(
  storyId: string,
  tags: string[]
): Promise<Story[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('stories')
    .select(
      'id,slug,title,excerpt,tags,read_time,cover_url,accent_color,published_at'
    )
    .eq('status', 'published')
    .neq('id', storyId)
    .overlaps('tags', tags)
    .limit(3)

  return (data as Story[]) ?? []
}

// ── Fetch all story slugs (for static generation) ──
export async function getAllStorySlugs(): Promise<string[]> {
  const supabase = createAdminSupabase()

  const { data } = await supabase
    .from('stories')
    .select('slug')
    .eq('status', 'published')

  return data?.map((s) => s.slug) ?? []
}

// ── Search stories ──
export async function searchStories(query: string): Promise<Story[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .rpc('search_stories', { query })
    .select('id,slug,title,excerpt,tags,read_time,cover_url,published_at')
    .limit(10)

  return (data as Story[]) ?? []
}

// ── Trending stories ──
export async function getTrendingStories(limit = 6): Promise<Story[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase.rpc('trending_stories', {
    limit_count: limit,
  })

  return (data as Story[]) ?? []
}

// ── Admin: get all stories (any status) ──
export async function adminGetStories(): Promise<Story[]> {
  const supabase = createAdminSupabase()

  const { data, error } = await supabase
    .from('stories')
    .select(
      '*, author:profiles!stories_author_id_fkey(id,display_name,avatar_url)'
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as Story[]) ?? []
}

// ── Admin: create story ──
export async function adminCreateStory(
  data: StoryFormData,
  authorId: string
): Promise<Story> {
  const supabase = createAdminSupabase()

  const { data: story, error } = await supabase
    .from('stories')
    .insert({
      ...data,
      author_id: authorId,
      published_at:
        data.status === 'published'
          ? new Date().toISOString()
          : null,
    })
    .select()
    .single()

  if (error) throw error

  return story as Story
}

// ── Admin: update story ──
export async function adminUpdateStory(
  id: string,
  data: Partial<StoryFormData>
): Promise<Story> {
  const supabase = createAdminSupabase()
  const updates: Record<string, unknown> = { ...data }

  if (data.status === 'published') {
    const { data: existing } = await supabase
      .from('stories')
      .select('published_at')
      .eq('id', id)
      .single()

    if (!existing?.published_at) {
      updates.published_at = new Date().toISOString()
    }
  }

  const { data: story, error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return story as Story
}

// ── Admin: delete story ──
export async function adminDeleteStory(id: string): Promise<void> {
  const supabase = createAdminSupabase()

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)

  if (error) throw error
}