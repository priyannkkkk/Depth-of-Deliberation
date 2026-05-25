// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { AdminNav }   from '@/components/admin/AdminNav'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
      <AdminNav />
      <div className="flex flex-1 pt-14">
        <AdminSidebar />
        <main className="flex-1 ml-0 md:ml-56 p-8 max-w-[1200px]">
          {children}
        </main>
      </div>
    </div>
  )
}
