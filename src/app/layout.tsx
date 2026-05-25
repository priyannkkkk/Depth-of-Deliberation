// src/app/layout.tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  variable: '--font-cormorant',
  display:  'swap',
})

const manrope = Manrope({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  variable: '--font-manrope',
  display:  'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depthsofdeliberation.com'),
  title: {
    default:  'Depths of Deliberation',
    template: '%s — Depths of Deliberation',
  },
  description:
    'A collection of stories & reflections woven through emotion, healing, overthinking, faith, and self-discovery.',
  keywords: [
    'storytelling', 'healing', 'overthinking', 'self-discovery',
    'emotional writing', 'personal essays', 'reflections', 'faith',
  ],
  authors: [{ name: 'Priyank Pateliya' }],
  creator: 'Priyank Pateliya',
  openGraph: {
    type:        'website',
    locale:      'en_US',
    siteName:    'Depths of Deliberation',
    title:       'Depths of Deliberation',
    description: 'A collection of stories & reflections woven through emotion, healing, overthinking, faith, and self-discovery.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Depths of Deliberation' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Depths of Deliberation',
    description: 'A collection of stories & reflections.',
    images:      ['/og-default.png'],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <body className="bg-bg-deep text-ink-primary font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background:  '#181410',
                color:       '#e6d9c0',
                border:      '0.5px solid rgba(196,163,90,0.25)',
                borderRadius: '0',
                fontFamily:  'var(--font-manrope)',
                fontSize:    '0.82rem',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
