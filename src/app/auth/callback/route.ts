// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase }      from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect with error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
