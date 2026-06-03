import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  transpilePackages: ['@cv-generator/renderer', '@cv-generator/schema', '@react-pdf/renderer'],
};

export default nextConfig;
