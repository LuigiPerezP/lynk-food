import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cqdkkhlkjpdbpgwpaest.supabase.co',
      },
    ],
  },
};

export default nextConfig;
