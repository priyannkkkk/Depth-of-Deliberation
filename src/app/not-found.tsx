import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="section-label mb-4">404</p>
      <h1 className="font-serif font-light text-cream text-5xl mb-4">Page Not Found</h1>
      <p className="font-serif italic text-[var(--ink-secondary)] mb-8">
        This page wandered off into the quiet dark.
      </p>
      <Link href="/" className="btn-ghost">Return to Stories</Link>
    </div>
  )
}
