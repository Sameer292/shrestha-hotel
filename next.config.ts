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
      { source: "/wp-admin/:path*", destination: `${origin}/wp-admin/:path*` },
      { source: "/wp-login.php", destination: `${origin}/wp-login.php` },
      { source: "/wp-login.php/:path*", destination: `${origin}/wp-login.php/:path*` },
      { source: "/wp-json/:path*", destination: `${origin}/wp-json/:path*` },
      { source: "/graphql", destination: `${origin}/graphql` },
      { source: "/graphql/:path*", destination: `${origin}/graphql/:path*` },
      { source: "/xmlrpc.php", destination: `${origin}/xmlrpc.php` },
      { source: "/wp-cron.php", destination: `${origin}/wp-cron.php` },
      {
        source: "/wp-content/:path*",
        destination: `${origin}/wp-content/:path*`,
      },
      { source: "/wp-includes/:path*", destination: `${origin}/wp-includes/:path*` },
    ];
  },
  images: {
    // Local-first: WP Media Library on the VPS (prod) or docker (dev).
    // images.unsplash.com stays only until real photos are uploaded —
    // then remove it. No picsum, no wildcards.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080" },
      { protocol: "https", hostname: "cms.shresthahotel.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
