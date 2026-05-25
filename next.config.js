/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },

      // Add this line
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig