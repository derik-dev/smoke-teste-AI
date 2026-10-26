import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/tests": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
