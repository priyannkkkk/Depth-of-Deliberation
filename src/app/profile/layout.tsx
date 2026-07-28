// src/app/profile/layout.tsx
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { Nav }             from '@/components/layout/Nav'
import { Footer }          from '@/components/layout/Footer'
import { SearchModal }     from '@/components/ui/SearchModal'
import { CursorGlow }      from '@/components/ui/CursorGlow'
import { ToastContainer }  from '@/components/ui/ToastContainer'
import { ProfileNav }      from '@/components/profile/ProfileNav'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth?next=/profile')

  return (
    <>
      <CursorGlow />
      <Nav />

      <main className="pt-40 pb-28 px-6 md:px-16">
        <div className="text-center mb-10">
          <p className="section-label">Your account</p>
          <h1
            className="font-serif font-light text-cream leading-[1.15]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            Reader <em className="italic text-gold">Profile</em>
          </h1>
        </div>

        <ProfileNav />

        <div className="max-w-[720px] mx-auto">{children}</div>
      </main>

      <Footer />
      <SearchModal />
      <ToastContainer />
    </>
  )
}
