// src/app/api/email/subscribe-confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminSupabase } from '@/lib/supabase'

const resend  = new Resend(process.env.RESEND_API_KEY)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depthsofdeliberation.com'
const fromEmail = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`

// POST /api/email/subscribe-confirm
export async function POST(req: NextRequest) {
  const { email, name, token } = await req.json()
  if (!email || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const confirmUrl = `${siteUrl}/api/email/confirm?token=${token}`

  try {
    await resend.emails.send({
      from:    fromEmail,
      to:      email,
      subject: 'Confirm your subscription — Depths of Deliberation',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="background:#0c0a08;color:#ddd0b4;font-family:Georgia,serif;margin:0;padding:40px 20px;">
          <div style="max-width:520px;margin:0 auto;">
            <p style="font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:#876c35;margin-bottom:2rem;">
              Depths of Deliberation
            </p>
            <h1 style="font-size:2rem;font-weight:300;color:#e6d9c0;margin-bottom:1rem;line-height:1.2;">
              You're almost in.
            </h1>
            <p style="font-style:italic;color:#8a7a60;line-height:1.9;margin-bottom:2rem;">
              ${name ? `Dear ${name},` : 'Dear reader,'}<br><br>
              Thank you for wanting to be part of this quiet space.
              Click below to confirm your subscription and receive new reflections
              whenever another piece of the mind finds words.
            </p>
            <a href="${confirmUrl}"
               style="display:inline-block;padding:14px 32px;background:#c4a35a;color:#0c0a08;
                      text-decoration:none;font-family:system-ui,sans-serif;
                      font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">
              Confirm Subscription
            </a>
            <p style="margin-top:2rem;font-size:0.72rem;color:#4e4232;">
              If you did not subscribe, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

// GET /api/email/confirm?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(`${siteUrl}?subscribed=error`)

  const admin = createAdminSupabase()
  const { error } = await admin
    .from('subscribers')
    .update({ confirmed: true, confirm_token: null })
    .eq('confirm_token', token)

  if (error) return NextResponse.redirect(`${siteUrl}?subscribed=error`)
  return NextResponse.redirect(`${siteUrl}?subscribed=true`)
}
