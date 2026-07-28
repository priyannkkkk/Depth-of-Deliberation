// src/app/profile/page.tsx — Server Component
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { getProfile } from '@/lib/queries/profile'
import { ProfileForm } from '@/components/profile/ProfileForm'

export const metadata: Metadata = {
  title: 'Your Profile',
}

export default async function ProfilePage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?next=/profile')

  const profile = await getProfile(session.user.id)
  if (!profile) return null

  return <ProfileForm profile={profile} email={session.user.email ?? ''} />
}

