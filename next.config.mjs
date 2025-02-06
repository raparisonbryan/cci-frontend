/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080'
      }
    ];
  }
};

export default nextConfig;