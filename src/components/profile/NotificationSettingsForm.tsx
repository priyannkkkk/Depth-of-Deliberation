'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { updateNotificationPreferences } from '@/lib/queries/interactions'
import type { NotificationPreferences } from '@/types'

interface NotificationSettingsFormProps {
  userId: string
  initialPreferences: NotificationPreferences | null
}

export function NotificationSettingsForm({ userId, initialPreferences }: NotificationSettingsFormProps) {
  const { addToast } = useStore()

  const [newStoryEmail, setNewStoryEmail] = useState(initialPreferences?.new_story_email ?? true)
  const [newsletter,    setNewsletter]    = useState(initialPreferences?.newsletter ?? true)
  const [saving, setSaving] = useState(false)

  async function persist(next: { new_story_email: boolean; newsletter: boolean }) {
    setSaving(true)
    try {
      await updateNotificationPreferences(userId, next)
      addToast('Preferences updated ✦')
    } catch {
      addToast('Could not update preferences', 'error')
    } finally {
      setSaving(false)
    }
  }

  function toggleNewStoryEmail() {
    const next = !newStoryEmail
    setNewStoryEmail(next)
    persist({ new_story_email: next, newsletter })
  }

  function toggleNewsletter() {
    const next = !newsletter
    setNewsletter(next)
    persist({ new_story_email: newStoryEmail, newsletter: next })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* New story email */}
      <div className="flex items-center justify-between gap-6
                      bg-[var(--bg-card)] border border-[var(--border)] p-5">
        <div>
          <p className="text-[var(--cream)] text-sm mb-1">New Story Email</p>
          <p className="text-[0.7rem] text-[var(--ink-muted)]">
            Get an email whenever a new story is published.
          </p>
        </div>
        <button
          onClick={toggleNewStoryEmail}
          disabled={saving}
          aria-pressed={newStoryEmail}
          className={`flex-shrink-0 px-4 py-1.5 text-[0.68rem] uppercase tracking-wider
                      border transition-all duration-300 disabled:opacity-50
                      ${newStoryEmail
                        ? 'bg-[var(--gold-faint)] text-gold border-[var(--gold-dim)]'
                        : 'border-[var(--border)] text-[var(--ink-muted)]'
                      }`}
        >
          {newStoryEmail ? 'On' : 'Off'}
        </button>
      </div>

      {/* Newsletter */}
      <div className="flex items-center justify-between gap-6
                      bg-[var(--bg-card)] border border-[var(--border)] p-5">
        <div>
          <p className="text-[var(--cream)] text-sm mb-1">Newsletter</p>
          <p className="text-[0.7rem] text-[var(--ink-muted)]">
            Occasional notes and reflections from the author.
          </p>
        </div>
        <button
          onClick={toggleNewsletter}
          disabled={saving}
          aria-pressed={newsletter}
          className={`flex-shrink-0 px-4 py-1.5 text-[0.68rem] uppercase tracking-wider
                      border transition-all duration-300 disabled:opacity-50
                      ${newsletter
                        ? 'bg-[var(--gold-faint)] text-gold border-[var(--gold-dim)]'
                        : 'border-[var(--border)] text-[var(--ink-muted)]'
                      }`}
        >
          {newsletter ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  )
}
