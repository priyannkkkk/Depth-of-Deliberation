// src/app/profile/notifications/page.tsx — Server Component
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { getNotificationPreferences } from '@/lib/queries/interactions'
import { NotificationSettingsForm } from '@/components/profile/NotificationSettingsForm'

export const metadata: Metadata = {
  title: 'Notification Settings',
}

export default async function NotificationsPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth?next=/profile/notifications')

  const preferences = await getNotificationPreferences(session.user.id)

  return (
    <NotificationSettingsForm
      userId={session.user.id}
      initialPreferences={preferences}
    />
  )
}
