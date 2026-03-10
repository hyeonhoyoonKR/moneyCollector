import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  reactCompiler: true,
  experimental: {
    allowedDevOrigins: ["192.168.35.83"],
  },
};

export default nextConfig;
