import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // TODO: remove this later 
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tmawwevnxsyemhqkkqjc.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/media/**",
      },
    ],
  },
};

export default nextConfig;
