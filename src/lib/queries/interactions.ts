// ═══════════════════════════════════════════════
// Interaction Queries — comments, reactions,
// ratings, bookmarks, reading progress
// ═══════════════════════════════════════════════
import { createServerSupabase, createBrowserSupabase, createAdminSupabase } from '@/lib/supabase'
import type {
  Comment, CommentFormData, Reaction, ReactionType,
  Bookmark, ReadingProgress, ReactionCount
} from '@/types'

// ════════════════════════════════════
// COMMENTS
// ════════════════════════════════════

export async function getComments(storyId: string): Promise<Comment[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_user_id_fkey(id,display_name,avatar_url)')
    .eq('story_id', storyId)
    .eq('is_approved', true)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Fetch replies for each top-level comment
  const comments = (data as Comment[]) ?? []
  const withReplies = await Promise.all(
    comments.map(async (comment) => {
      const { data: replies } = await supabase
        .from('comments')
        .select('*, author:profiles!comments_user_id_fkey(id,display_name,avatar_url)')
        .eq('parent_id', comment.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: true })

      return { ...comment, replies: (replies as Comment[]) ?? [] }
    })
  )

  return withReplies
}

export async function addComment(
  storyId: string,
  formData: CommentFormData,
  userId?: string
): Promise<Comment> {
  const supabase = createBrowserSupabase()
  const { data, error } = await supabase
    .from('comments')
    .insert({
      story_id:    storyId,
      user_id:     userId ?? null,
      parent_id:   formData.parent_id ?? null,
      author_name: formData.author_name ?? null,
      body:        formData.body,
    })
    .select('*, author:profiles!comments_user_id_fkey(id,display_name,avatar_url)')
    .single()

  if (error) throw error
  return data as Comment
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createBrowserSupabase()
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) throw error
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  const supabase = createBrowserSupabase()

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    await supabase.from('comment_likes')
      .delete().eq('comment_id', commentId).eq('user_id', userId)
    await supabase.from('comments')
      .update({ like_count: supabase.rpc('greatest', { a: 0 }) })
      .eq('id', commentId)
    return false
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId })
    await supabase.rpc('increment_comment_likes', { comment_id: commentId })
    return true
  }
}

// ════════════════════════════════════
// REACTIONS
// ════════════════════════════════════

export async function getReactionCounts(storyId: string): Promise<ReactionCount[]> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('reaction_counts')
    .select('*')
    .eq('story_id', storyId)

  return (data as ReactionCount[]) ?? []
}

export async function getUserReactions(
  storyId: string,
  userId?: string,
  sessionId?: string
): Promise<ReactionType[]> {
  const supabase = createBrowserSupabase()

  let query = supabase
    .from('reactions')
    .select('reaction')
    .eq('story_id', storyId)

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else {
    return []
  }

  const { data } = await query
  return data?.map((r: { reaction: ReactionType }) => r.reaction) ?? []
}

export async function toggleReaction(
  storyId: string,
  reaction: ReactionType,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  const supabase = createBrowserSupabase()

  let existsQuery = supabase
    .from('reactions')
    .select('reaction')
    .eq('story_id', storyId)
    .eq('reaction', reaction)

  if (userId)    existsQuery = existsQuery.eq('user_id', userId)
  else if (sessionId) existsQuery = existsQuery.eq('session_id', sessionId)

  const { data: existing } = await existsQuery.single()

  if (existing) {
    let deleteQuery = supabase
      .from('reactions')
      .delete()
      .eq('story_id', storyId)
      .eq('reaction', reaction)
    if (userId)    deleteQuery = deleteQuery.eq('user_id', userId)
    else if (sessionId) deleteQuery = deleteQuery.eq('session_id', sessionId)
    await deleteQuery
    return false
  } else {
    await supabase.from('reactions').insert({
      story_id:   storyId,
      reaction,
      user_id:    userId    ?? null,
      session_id: sessionId ?? null,
    })
    return true
  }
}

// ════════════════════════════════════
// RATINGS
// ════════════════════════════════════

export async function getUserRating(
  storyId: string,
  userId?: string,
  sessionId?: string
): Promise<number | null> {
  const supabase = createBrowserSupabase()
  let query = supabase
    .from('ratings')
    .select('stars')
    .eq('story_id', storyId)

  if (userId)         query = query.eq('user_id', userId)
  else if (sessionId) query = query.eq('session_id', sessionId)
  else                return null

  const { data } = await query.single()
  return data?.stars ?? null
}

export async function setRating(
  storyId: string,
  stars: number,
  userId?: string,
  sessionId?: string
): Promise<void> {
  const supabase = createBrowserSupabase()

  const record = {
    story_id:   storyId,
    stars,
    user_id:    userId    ?? null,
    session_id: sessionId ?? null,
    updated_at: new Date().toISOString(),
  }

  const conflictCol = userId ? 'story_id, user_id' : 'story_id, session_id'
  const { error } = await supabase
    .from('ratings')
    .upsert(record, { onConflict: conflictCol })

  if (error) throw error
}

// ════════════════════════════════════
// BOOKMARKS
// ════════════════════════════════════

export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
  const supabase = createBrowserSupabase()
  const { data } = await supabase
    .from('bookmarks')
    .select('*, story:stories(id,slug,title,excerpt,tags,read_time,cover_url,accent_color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data as Bookmark[]) ?? []
}

export async function isBookmarked(storyId: string, userId: string): Promise<boolean> {
  const supabase = createBrowserSupabase()
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', userId)
    .single()

  return !!data
}

export async function toggleBookmark(
  storyId: string,
  userId: string,
  collection = 'default'
): Promise<boolean> {
  const supabase = createBrowserSupabase()
  const already = await isBookmarked(storyId, userId)

  if (already) {
    await supabase.from('bookmarks')
      .delete().eq('story_id', storyId).eq('user_id', userId)
    return false
  } else {
    await supabase.from('bookmarks')
      .insert({ story_id: storyId, user_id: userId, collection })
    return true
  }
}

// ════════════════════════════════════
// READING PROGRESS
// ════════════════════════════════════

export async function saveReadingProgress(
  userId: string,
  storyId: string,
  progressPct: number
): Promise<void> {
  const supabase = createBrowserSupabase()
  await supabase
    .from('reading_progress')
    .upsert({
      user_id:      userId,
      story_id:     storyId,
      progress_pct: progressPct,
      completed:    progressPct >= 95,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id, story_id' })
}

export async function getReadingProgress(
  userId: string,
  storyId: string
): Promise<ReadingProgress | null> {
  const supabase = createBrowserSupabase()
  const { data } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .single()

  return data as ReadingProgress | null
}

// ════════════════════════════════════
// SUBSCRIBERS
// ════════════════════════════════════

export async function subscribe(email: string, name?: string): Promise<void> {
  const supabase = createBrowserSupabase()
  const token = crypto.randomUUID()

  const { error } = await supabase
    .from('subscribers')
    .upsert({
      email,
      name:          name ?? null,
      confirm_token: token,
      confirmed:     false,
    }, { onConflict: 'email' })

  if (error) throw error

  await fetch('/api/email/subscribe-confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, token }),
  })
}

// ════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════

export async function trackView(
  storyId: string,
  sessionId: string,
  userId?: string
): Promise<void> {
  const supabase = createBrowserSupabase()
  await supabase.rpc('increment_view', {
    p_story_id:   storyId,
    p_session_id: sessionId,
    p_user_id:    userId ?? null,
    p_referrer:   document.referrer || null,
    p_country:    null,
  })
}