/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    ppr: 'incremental'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**'
      }
    ]
  }
};

export default nextConfig;
