import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // ponytail: dev opened via LAN IP gets 403 HMR/chunks without this
  allowedDevOrigins: ["192.168.100.142", "*.local", "shrestha.localhost"],
  // Image URLs are emitted relative (/wp-content/…) so any host works.
  // The proxies route that prefix to WP; this rewrite covers direct :3000.
  async rewrites() {
    let origin = "http://localhost:8080";
    try {
      const api = process.env.WORDPRESS_API_URL || "";
      if (api) origin = new URL(api).origin;
    } catch {
      /* keep default */
    }
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: `${origin}/wp-content/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }, { protocol: "https", hostname: "cms.shresthahotel.com" }, { protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
