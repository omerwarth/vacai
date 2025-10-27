import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Static export for Azure Static Web Apps - API routes moved to Azure Functions
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
