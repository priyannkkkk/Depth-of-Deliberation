// ═══════════════════════════════════════════════
// Depths of Deliberation — Core TypeScript Types
// ═══════════════════════════════════════════════

// ── Database row types ──────────────────────────
export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type StoryStatus = 'draft' | 'published' | 'archived'
export type FeaturedSize = 'large' | 'medium' | 'medium2'
export type ReactionType = 'understood' | 'peaceful' | 'emotional' | 'heavy' | 'inspired' | 'seen' | 'healing'

export interface Story {
  id: string
  slug: string
  title: string
  lesson: string | null
  body_html: string
  excerpt: string | null
  cover_url: string | null
  accent_color: string
  read_time: number
  status: StoryStatus
  featured: boolean
  featured_size: FeaturedSize
  featured_order: number
  tags: string[]
  author_id: string | null
  view_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  // joined
  author?: Profile
  stats?: StoryStats
  reaction_counts?: ReactionCount[]
  user_reaction?: ReactionType | null
  user_rating?: number | null
  user_bookmarked?: boolean
}

export interface StoryStats {
  id: string
  slug: string
  title: string
  view_count: number
  comment_count: number
  reaction_count: number
  avg_rating: number | null
  rating_count: number
  bookmark_count: number
}

export interface Comment {
  id: string
  story_id: string
  user_id: string | null
  parent_id: string | null
  author_name: string | null
  body: string
  is_approved: boolean
  like_count: number
  created_at: string
  updated_at: string
  // joined
  author?: Profile | null
  replies?: Comment[]
  user_liked?: boolean
}

export interface Reaction {
  story_id: string
  user_id: string | null
  session_id: string | null
  reaction: ReactionType
  created_at: string
}

export interface ReactionCount {
  story_id: string
  reaction: ReactionType
  count: number
}

export interface Rating {
  story_id: string
  user_id: string | null
  session_id: string | null
  stars: number
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  story_id: string
  collection: string
  created_at: string
  story?: Story
}

export interface ReadingProgress {
  user_id: string
  story_id: string
  progress_pct: number
  completed: boolean
  updated_at: string
}

export interface Subscriber {
  id: string
  email: string
  name: string | null
  confirmed: boolean
  confirm_token: string | null
  subscribed_at: string
  user_id: string | null
}

// ── API response types ──────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ── Form types ──────────────────────────────────
export interface StoryFormData {
  title: string
  slug: string
  lesson: string
  body_html: string
  excerpt: string
  tags: string[]
  status: StoryStatus
  featured: boolean
  featured_size: FeaturedSize
  featured_order: number
  accent_color: string
  cover_url?: string
}

export interface CommentFormData {
  body: string
  author_name?: string
  parent_id?: string
}

export interface SubscribeFormData {
  email: string
  name?: string
}

// ── UI state types ───────────────────────────────
export interface ReaderState {
  progress: number
  isReading: boolean
  bookmarked: boolean
  userRating: number | null
  userReactions: ReactionType[]
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// ── Admin types ──────────────────────────────────
export interface AdminStats {
  totalStories: number
  publishedStories: number
  totalViews: number
  totalSubscribers: number
  totalComments: number
  viewsThisMonth: number
  topStories: StoryStats[]
  reactionBreakdown: Record<ReactionType, number>
}

// ── Utility types ────────────────────────────────
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export const REACTION_LABELS: Record<ReactionType, { label: string; emoji: string }> = {
  understood: { label: 'Understood',  emoji: '🤝' },
  peaceful:   { label: 'Peaceful',    emoji: '🕊️' },
  emotional:  { label: 'Emotional',   emoji: '💧' },
  heavy:      { label: 'Heavy',       emoji: '🌑' },
  inspired:   { label: 'Inspired',    emoji: '✨' },
  seen:       { label: 'Seen',        emoji: '👁️' },
  healing:    { label: 'Healing',     emoji: '🌿' },
}

export const STORY_TAGS = [
  'resilience', 'faith', 'healing', 'loneliness', 'self-reflection',
  'love', 'fear', 'peace', 'darkness', 'transformation', 'growth',
  'patience', 'forgiveness', 'overthinking', 'family', 'loss',
  'gratitude', 'freedom', 'trust', 'identity', 'spirituality',
] as const

export type StoryTag = typeof STORY_TAGS[number]
