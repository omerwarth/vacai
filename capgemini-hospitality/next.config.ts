import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Removed output: 'export' to enable server-side rendering for dynamic routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
