/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization for pages without data fetching
  reactStrictMode: true,
  
  // Enable image optimization
  images: {
    domains: ['res.cloudinary.com'],
    // Optimize images on demand instead of build time
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Optimize production builds
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Cache build output
  output: 'standalone',
  
  // Optimize package imports
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },
};

module.exports = nextConfig; 