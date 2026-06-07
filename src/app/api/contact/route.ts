import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()
  if (!email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    await resend.emails.send({
      from:    `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to:      'priyankpateliya2004@gmail.com',
      reply_to: email,
      subject: `New message from ${name || email} — Depths of Deliberation`,
      html: `<p><strong>From:</strong> ${name || 'Anonymous'} &lt;${email}&gt;</p>
             <p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
