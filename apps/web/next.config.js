/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 640, 750, 1080],
    imageSizes: [128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.titti.co.il',
      },
      {
        protocol: 'https',
        hostname: '**.sexfire.co.il',
      },
      {
        protocol: 'https',
        hostname: '**.xfinder.co.il',
      },
    ],
  },
  async redirects() {
    return [
      // Deleted filter pages → homepage
      { source: '/escorts/vip', destination: '/', permanent: true },
      { source: '/escorts/verified', destination: '/', permanent: true },
      { source: '/escorts/new', destination: '/', permanent: true },
      { source: '/escorts/russian', destination: '/', permanent: true },
      { source: '/escorts/massage', destination: '/', permanent: true },
      // Deleted guide pages → homepage
      { source: '/guide/:slug', destination: '/', permanent: true },
      // Deleted city×filter cross-pages → city page
      { source: '/:city(tel-aviv|haifa|jerusalem|eilat|netanya|bat-yam|beer-sheva|ashdod|rishon-lezion|herzliya|hadera)/:filter', destination: '/:city', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), browsing-topics=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
