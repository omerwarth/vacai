import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" to enable API routes for Cosmos DB integration
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
