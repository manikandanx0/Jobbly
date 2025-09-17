/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Proxy backend Flask API endpoints
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:5000/api/users/:path*'
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5000/api/users/:path*'
      },
      {
        source: '/api/multilingual/:path*',
        destination: 'http://localhost:5000/api/multilingual/:path*'
      }
      ,{
        source: '/api/applications',
        destination: 'http://localhost:5000/api/multilingual/applications'
      }
    ];
  }
};
export default nextConfig;
