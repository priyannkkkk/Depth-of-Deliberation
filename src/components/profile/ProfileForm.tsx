'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { updateProfile, uploadAvatar } from '@/lib/queries/profile'
import type { Profile } from '@/types'

interface ProfileFormProps {
  profile: Profile
  email:   string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const { setUser, addToast } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarUrl,   setAvatarUrl]   = useState(profile.avatar_url)
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio,          setBio]         = useState(profile.bio ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadAvatar(profile.id, file)
      setAvatarUrl(url)
      addToast('Avatar uploaded ✦')
    } catch {
      addToast('Could not upload avatar', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateProfile(profile.id, {
        display_name: displayName,
        bio,
        avatar_url:   avatarUrl,
      })
      setUser(updated)
      addToast('Profile updated ✦')
      router.refresh()
    } catch {
      addToast('Could not update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div
          className="w-24 h-24 rounded-full bg-[var(--bg-card)] border border-[var(--border)]
                     flex items-center justify-center overflow-hidden flex-shrink-0"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || 'Avatar'} className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif font-light text-4xl text-[var(--gold-faint)]">
              {(displayName || email)[0]?.toUpperCase() ?? 'U'}
            </span>
          )}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="btn-ghost cursor-pointer inline-flex disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Change Avatar'}
          </label>
          <p className="text-[0.68rem] text-[var(--ink-muted)] mt-2">
            JPG or PNG, square images look best.
          </p>
        </div>
      </div>

      {/* Email (read only) */}
      <div>
        <label className="section-label block mb-2">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          disabled
          className="input opacity-60 cursor-not-allowed"
        />
      </div>

      {/* Display name */}
      <div>
        <label className="section-label block mb-2">Display Name</label>
        <input
          type="text"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="section-label block mb-2">Bio</label>
        <textarea
          placeholder="A few words about yourself…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
