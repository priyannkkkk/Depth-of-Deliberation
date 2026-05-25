// src/app/page.tsx  — Server Component
import type { Metadata } from 'next'
import { getFeaturedStories, getStories } from '@/lib/queries/stories'
import { Nav }            from '@/components/layout/Nav'
import { Footer }         from '@/components/layout/Footer'
import { Hero }           from '@/components/home/Hero'
import { FeaturedGrid }   from '@/components/home/FeaturedGrid'
import { MoreStories }    from '@/components/home/MoreStories'
import { AboutSection }   from '@/components/home/AboutSection'
import { SubscribeSection }from '@/components/home/SubscribeSection'
import { ContactSection } from '@/components/home/ContactSection'
import { SearchModal }    from '@/components/ui/SearchModal'
import { CursorGlow }     from '@/components/ui/CursorGlow'
import { ToastContainer } from '@/components/ui/ToastContainer'

export const metadata: Metadata = {
  title: 'Depths of Deliberation',
  description:
    'A collection of stories & reflections woven through emotion, healing, overthinking, faith, and self-discovery.',
}

// Revalidate homepage every 60 seconds
export const revalidate = 60

export default async function HomePage() {
  const [featured, { data: moreStories }] = await Promise.all([
    getFeaturedStories(),
    getStories({ page: 1, pageSize: 9 }),
  ])

  return (
    <>
      <CursorGlow />
      <Nav />

      <main>
        <Hero />

        {/* Featured Stories — Big 3 */}
        <section id="featured" aria-label="Featured stories">
          <FeaturedGrid stories={featured} />
        </section>

        {/* All Stories */}
        <section id="stories" aria-label="All stories">
          <MoreStories initialStories={moreStories} />
        </section>

        {/* About */}
        <section id="about" aria-label="About the author">
          <AboutSection />
        </section>

        {/* Subscribe */}
        <section id="subscribe" aria-label="Newsletter">
          <SubscribeSection />
        </section>

        {/* Contact */}
        <section id="contact" aria-label="Contact">
          <ContactSection />
        </section>
      </main>

      <Footer />
      <SearchModal />
      <ToastContainer />
    </>
  )
}
