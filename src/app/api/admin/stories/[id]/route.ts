// src/app/api/admin/stories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase'
import { getReadingTime } from '@/lib/utils'

async function requireAdmin(supabase: SupabaseClient) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  return profile?.is_admin ? session : null
}

// PATCH /api/admin/stories/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabase()
  const session = await requireAdmin(supabase)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const admin = createAdminSupabase()

  let updates = { ...body }

  if (body.status === 'published') {
    const { data: existing } = await admin
      .from('stories')
      .select('published_at')
      .eq('id', params.id)
      .single()

    if (!existing?.published_at) {
      updates.published_at = new Date().toISOString()
    }
  }

  if (body.body_html) {
    updates.read_time = getReadingTime(body.body_html)
  }

  const { data, error } = await admin
    .from('stories')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// DELETE /api/admin/stories/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabase()
  const session = await requireAdmin(supabase)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  const admin = createAdminSupabase()

  const { error } = await admin
    .from('stories')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return new NextResponse(null, { status: 204 })
}