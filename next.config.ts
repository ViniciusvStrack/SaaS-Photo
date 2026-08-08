import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // Cache optimized images for 1 hour
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [32, 64, 128, 256],
  },

  // Performance
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false, // Disable double-renders in dev

  // Reduce bundle: external heavy server-only packages
  serverExternalPackages: ["pg", "bcryptjs", "jose"],

  // HTTP headers
  async headers() {
    return [
      {
        // Static assets — cache forever
        source: "/:path*.(ico|png|jpg|jpeg|webp|avif|svg|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // JS/CSS bundles — cache forever (hashed filenames)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // API — no cache, always fresh
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        // Security headers for all pages
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
