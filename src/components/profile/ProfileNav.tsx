'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Bookmark, BookOpen, Bell } from 'lucide-react'

const links = [
  { href: '/profile',              label: 'Profile',          icon: User },
  { href: '/profile/bookmarks',    label: 'Saved Stories',    icon: Bookmark },
  { href: '/profile/continue-reading', label: 'Continue Reading', icon: BookOpen },
  { href: '/profile/notifications',label: 'Notifications',    icon: Bell },
]

export function ProfileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Profile sections"
      className="flex flex-wrap gap-2.5 justify-center mb-14"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href as any}
            className={`flex items-center gap-2 px-5 py-2.5 text-[0.72rem]
                        tracking-[0.1em] uppercase border transition-all duration-300
                        ${active
                          ? 'bg-[var(--gold-faint)] text-gold border-[var(--gold-dim)]'
                          : 'bg-transparent text-[var(--ink-secondary)] border-[var(--border)] hover:text-gold hover:border-[var(--gold-dim)] hover:bg-[var(--gold-faint)]'
                        }`}
          >
            <Icon size={13} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
