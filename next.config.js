/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '13.52.109.62',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'nurishdoc.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'nurishdoc.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nurishdoc.s3.us-west-1.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
