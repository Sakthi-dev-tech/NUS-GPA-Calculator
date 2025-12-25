import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/NUS-GPA-Calculator',
  assetPrefix: '/NUS-GPA-Calculator/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
