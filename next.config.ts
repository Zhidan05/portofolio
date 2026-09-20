import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Helsinki's source design is never part of the deployment artifact.
  outputFileTracingExcludes: { "/*": ["./stitch-reference/**/*"] },
};

export default nextConfig;
