// ═══════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugifyLib from 'slugify'
import readingTimeLib from 'reading-time'
import { formatDistanceToNow, format } from 'date-fns'

// ── Tailwind class merge helper ──────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Slugify ──────────────────────────────────────
export function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true })
}

// ── Reading time ─────────────────────────────────
export function getReadingTime(html: string): number {
  // Strip HTML tags for word count
  const text = html.replace(/<[^>]*>/g, ' ')
  const result = readingTimeLib(text)
  return Math.ceil(result.minutes)
}

// ── Date formatting ──────────────────────────────
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMMM d, yyyy')
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

// ── Anonymous session ID ─────────────────────────
const SESSION_KEY = 'dod_session_id'

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'

  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// ── Truncate text ────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// ── Strip HTML ───────────────────────────────────
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ── Auto-excerpt from HTML body ──────────────────
export function makeExcerpt(html: string, maxLength = 180): string {
  return truncate(stripHtml(html), maxLength)
}

// ── Tag color mapping ─────────────────────────────
export function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    resilience:    '#7c5c2a',
    faith:         '#4a6741',
    healing:       '#3d5c4a',
    love:          '#6e3a3a',
    fear:          '#3a3a5c',
    peace:         '#3a5c5c',
    darkness:      '#2a2a3a',
    transformation:'#5c3a6e',
    growth:        '#3a5c3a',
    patience:      '#5c4a2a',
    loneliness:    '#3a4a5c',
    forgiveness:   '#5c4a5c',
    overthinking:  '#4a4a5c',
    family:        '#5c3a4a',
    gratitude:     '#4a5c3a',
    freedom:       '#3a5c5a',
  }
  return colors[tag] ?? '#3a3a2a'
}

// ── OG Image URL helper ──────────────────────────
export function getOgImageUrl(title: string, excerpt?: string): string {
  const params = new URLSearchParams({ title, excerpt: excerpt ?? '' })
  return `/api/og?${params.toString()}`
}

// ── Debounce ─────────────────────────────────────
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      void fn(...args)
    }, delay)
  }
}

// ── Copy to clipboard ────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
