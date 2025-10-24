import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Make static export opt-in so dynamic server features (API routes, force-dynamic)
  // continue to work in local dev. Set NEXT_EXPORT=true to enable static export.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

if (process.env.NEXT_EXPORT === 'true') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - NextConfig type doesn't expose conditional union for this pattern
  (nextConfig as any).output = 'export';
}

export default nextConfig;
