import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server-side rendering for Azure App Service
  trailingSlash: true,
  
  // Image optimization settings
  images: {
    unoptimized: true, // Disable image optimization for simpler deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow images from any HTTPS source
      },
    ],
  },

  // Configure for production deployment
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  
  // Optimize build output for Azure App Service
  output: undefined, // Ensure we're not using static export
  
  // Configure file tracing for deployment
  outputFileTracingRoot: process.cwd(),
  
  // Experimental features
  experimental: {
    // Enable newer React features if needed
    serverComponentsExternalPackages: ['@azure/cosmos'],
  },
};

export default nextConfig;
