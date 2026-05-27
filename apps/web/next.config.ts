import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@kairos/ui", "@kairos/utils", "@kairos/types",
    "@kairos/services-ai", "@kairos/chat",
    "@kairos/cells", "@kairos/finance", "@kairos/members",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
