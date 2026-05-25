// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title   = searchParams.get('title')   ?? 'Depths of Deliberation'
  const excerpt = searchParams.get('excerpt') ?? 'A collection of stories & reflections'

  return new ImageResponse(
    (
      <div
        style={{
          width:      '100%',
          height:     '100%',
          display:    'flex',
          flexDirection: 'column',
          alignItems:  'center',
          justifyContent: 'center',
          background:  'linear-gradient(135deg, #0c0a08 0%, #1a1208 50%, #0c0a08 100%)',
          padding:     '80px',
          fontFamily:  'Georgia, serif',
        }}
      >
        {/* Top label */}
        <p style={{
          fontSize:      14,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color:         '#876c35',
          marginBottom:  32,
        }}>
          Depths of Deliberation
        </p>

        {/* Gold line */}
        <div style={{
          width:        80,
          height:       1,
          background:   'linear-gradient(to right, transparent, #c4a35a, transparent)',
          marginBottom: 40,
        }} />

        {/* Title */}
        <h1 style={{
          fontSize:   title.length > 40 ? 52 : 68,
          fontWeight: 300,
          color:      '#e6d9c0',
          lineHeight: 1.1,
          textAlign:  'center',
          margin:     '0 0 24px',
          maxWidth:   900,
        }}>
          {title}
        </h1>

        {/* Excerpt */}
        <p style={{
          fontSize:   22,
          fontStyle:  'italic',
          color:      '#8a7a60',
          textAlign:  'center',
          maxWidth:   700,
          lineHeight: 1.6,
          margin:     0,
        }}>
          {excerpt.slice(0, 120)}{excerpt.length > 120 ? '…' : ''}
        </p>

        {/* Bottom gold line */}
        <div style={{
          width:        80,
          height:       1,
          background:   'linear-gradient(to right, transparent, #c4a35a, transparent)',
          marginTop:    40,
        }} />
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  )
}
