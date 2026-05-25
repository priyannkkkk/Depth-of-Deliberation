import { notFound } from 'next/navigation'
import { createAdminSupabase } from '@/lib/supabase'
import { StoryEditor } from '@/components/admin/StoryEditor'
import type { Story } from '@/types'

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const supabase = createAdminSupabase()
  const { data } = await supabase.from('stories').select('*').eq('id', params.id).single()
  if (!data) notFound()
  return <StoryEditor story={data as Story} />
}
