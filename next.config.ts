import type { NextConfig } from "next";

// On GitHub Pages the site lives under /<repo>. The workflow sets NEXT_PUBLIC_BASE_PATH
// automatically; leave it empty for local dev or a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // fully static site in ./out (no Node server needed)
  basePath,
  trailingSlash: true, // /tables/bookings/ -> /tables/bookings/index.html
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: ["shiki"],
};

export default nextConfig;
