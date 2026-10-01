import type { NextConfig } from "next";

// Uploaded media is served from /files/... by default. When the bucket is public
// (S3_PUBLIC_URL, e.g. R2 with a custom domain) next/image needs that host allow-listed;
// it's read at build time.
const pub = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;
type RemotePatterns = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;
const remotePatterns: RemotePatterns = pub
  ? [{ protocol: pub.protocol.replace(":", "") as "https" | "http", hostname: pub.hostname, pathname: "/media/**" }]
  : [];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/files/**" }],
    remotePatterns,
  },
  async headers() {
    return [
      {
        // Optimized media is regenerated with the same names only by `npm run media`,
        // so a long cache with revalidation is safe.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
