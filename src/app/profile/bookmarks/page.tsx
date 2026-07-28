// src/app/profile/bookmarks/page.tsx
import type { Metadata } from 'next'
import { BookmarksList } from '@/components/profile/BookmarksList'

export const metadata: Metadata = {
  title: 'Saved Stories',
}

export default function BookmarksPage() {
  return <BookmarksList />
}
