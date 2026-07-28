// ═══════════════════════════════════════════════
// Profile Queries — reader account settings
// (display name, bio, avatar upload)
// ═══════════════════════════════════════════════
import { createServerSupabase, createBrowserSupabase } from '@/lib/supabase'
import type { Profile, ProfileFormData } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data as Profile | null
}

export async function updateProfile(
  userId: string,
  data: ProfileFormData
): Promise<Profile> {
  const supabase = createBrowserSupabase()

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      display_name: data.display_name,
      bio:          data.bio,
      ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
      updated_at:   new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return profile as Profile
}

// ── Avatar upload — uses the existing public "avatars" storage bucket ──
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = createBrowserSupabase()

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
