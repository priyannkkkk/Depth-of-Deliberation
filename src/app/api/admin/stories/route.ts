// src/app/api/admin/stories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase'
import { getReadingTime, slugify } from '@/lib/utils'
import type { StoryFormData } from '@/types'

// GET /api/admin/stories — list all stories
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!profile?.is_admin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminSupabase()
  const { data, error } = await admin
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/stories — create story
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!profile?.is_admin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body: StoryFormData = await req.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const admin = createAdminSupabase()
  const { data, error } = await admin
    .from('stories')
    .insert({
      ...body,
      author_id:    session.user.id,
      read_time:    getReadingTime(body.body_html),
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
