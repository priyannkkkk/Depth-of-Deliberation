'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, MessageCircle, Users, PenLine } from 'lucide-react'

const links = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/stories',     label: 'Stories',     icon: BookOpen },
  { href: '/admin/stories/new', label: 'New Story',   icon: PenLine },
  { href: '/admin/comments',    label: 'Comments',    icon: MessageCircle },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Users },
]

export function AdminSidebar() {
  const path = usePathname()
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-56
                      bg-[var(--bg-dark)] border-r border-[var(--border)] py-6 px-4 gap-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}
          className={`flex items-center gap-3 px-4 py-2.5 text-[0.75rem] uppercase
                      tracking-wider transition-all duration-200
                      ${path === href
                        ? 'bg-[var(--gold-faint)] text-gold border-l-2 border-gold pl-3.5'
                        : 'text-[var(--ink-secondary)] hover:text-gold hover:bg-[var(--gold-faint)]'
                      }`}>
          <Icon size={13}/>{label}
        </Link>
      ))}
    </aside>
  )
}
