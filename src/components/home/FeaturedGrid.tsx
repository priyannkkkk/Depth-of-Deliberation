'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import type { Story } from '@/types'

interface FeaturedGridProps {
  stories: Story[]
}

export function FeaturedGrid({ stories }: FeaturedGridProps) {
  const ref = useRef<HTMLDivElement>(null)

  const inView = useInView(ref, {
    once: true,
    margin: '-80px',
  })

  if (!stories.length) return null

  return (
    <section
      ref={ref}
      className="site-width mx-auto px-6 md:px-16 py-24"
    >
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <p className="text-[0.7rem] tracking-[0.25em] uppercase text-gold mb-4">
          Must Read
        </p>

        <h2 className="font-serif text-4xl md:text-5xl">
          Stories that stay with you
        </h2>
      </motion.div>

      {/* Floating story covers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 items-start">
        {stories.map((story, index) => (
          <FloatingStory
            key={story.id}
            story={story}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

interface FloatingStoryProps {
  story: Story
  index: number
}

function FloatingStory({ story, index }: FloatingStoryProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: '-60px',
      }}
      transition={{
        duration: 0.8,
        delay: index * 0.08,
      }}
      className="relative"
    >
      <Link href={`/story/${story.slug}`}>
        <motion.div
          animate={{
            y: [0, -14, 0, 10, 0],
            rotate: [0, 1, 0, -1, 0],
          }}
          transition={{
            duration: 7 + (index % 4),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.6,
          }}
          whileHover={{
            scale: 1.03,
            y: -8,
          }}
          className="
            relative
            w-full
            max-w-[320px]
            mx-auto
            overflow-hidden
            rounded-sm
            shadow-2xl
          "
        >
          {story.cover_url ? (
            <>
              <Image
                src={story.cover_url}
                alt={story.title}
                width={800}
                height={1200}
                className="block w-full h-auto"
              />

              {/* Story name */}
              <div className="absolute inset-x-0 bottom-0 p-5 pt-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <h3 className="font-serif text-xl md:text-2xl text-white">
                  {story.title}
                </h3>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center p-6 min-h-[300px] bg-black/10">
              <h3 className="font-serif text-xl md:text-2xl text-white text-center">
                {story.title}
              </h3>
            </div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  )
}
