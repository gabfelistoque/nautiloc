/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/boats',
        destination: '/barcos',
        permanent: true,
      },
      {
        source: '/boats/:path*',
        destination: '/barcos/:path*',
        permanent: true,
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Accept',
            value: 'video/mp4,video/webm,video/*,*/*',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
