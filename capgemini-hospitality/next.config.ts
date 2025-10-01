import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  outputFileTracingRoot: path.join(process.cwd())
};

export default nextConfig;
