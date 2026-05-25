// ═══════════════════════════════════════════════
// Global Zustand Store
// ═══════════════════════════════════════════════
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Profile, ReactionType, ToastMessage } from '@/types'

interface AppStore {
  // ── Auth ────────────────────────────────────
  user: Profile | null
  setUser: (user: Profile | null) => void

  // ── Reader state ────────────────────────────
  readerProgress: number
  setReaderProgress: (pct: number) => void

  // ── Per-story client state ───────────────────
  reactions:  Record<string, ReactionType[]>  // storyId → active reactions
  ratings:    Record<string, number>           // storyId → star count
  bookmarks:  Set<string>                      // storyIds

  setReactions: (storyId: string, reactions: ReactionType[]) => void
  toggleReaction: (storyId: string, reaction: ReactionType) => void
  setRating:   (storyId: string, stars: number) => void
  setBookmark: (storyId: string, value: boolean) => void

  // ── Toast notifications ──────────────────────
  toasts: ToastMessage[]
  addToast:    (msg: string, type?: ToastMessage['type']) => void
  removeToast: (id: string) => void

  // ── Search ──────────────────────────────────
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // ── UI ──────────────────────────────────────
  navScrolled: boolean
  setNavScrolled: (v: boolean) => void
}

export const useStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // ── Auth ──────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ── Reader ────────────────────────────────
      readerProgress: 0,
      setReaderProgress: (pct) => set({ readerProgress: pct }),

      // ── Reactions ────────────────────────────
      reactions: {},
      setReactions: (storyId, reactions) =>
        set((s) => ({ reactions: { ...s.reactions, [storyId]: reactions } })),

      toggleReaction: (storyId, reaction) =>
        set((s) => {
          const current = s.reactions[storyId] ?? []
          const has     = current.includes(reaction)
          return {
            reactions: {
              ...s.reactions,
              [storyId]: has
                ? current.filter((r) => r !== reaction)
                : [...current, reaction],
            },
          }
        }),

      // ── Ratings ──────────────────────────────
      ratings: {},
      setRating: (storyId, stars) =>
        set((s) => ({ ratings: { ...s.ratings, [storyId]: stars } })),

      // ── Bookmarks ────────────────────────────
      bookmarks: new Set(),
      setBookmark: (storyId, value) =>
        set((s) => {
          const next = new Set(s.bookmarks)
          value ? next.add(storyId) : next.delete(storyId)
          return { bookmarks: next }
        }),

      // ── Toasts ───────────────────────────────
      toasts: [],
      addToast: (message, type = 'success') => {
        const id = crypto.randomUUID()
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
        setTimeout(() => get().removeToast(id), 3200)
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ── Search ───────────────────────────────
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      // ── UI ───────────────────────────────────
      navScrolled: false,
      setNavScrolled: (v) => set({ navScrolled: v }),
    }),
    { name: 'depths-store' }
  )
)
