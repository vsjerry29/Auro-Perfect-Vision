import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(process.cwd(), "src"),
      "lucide-react$": path.resolve(process.cwd(), "src/lib/icons.ts"),
      "date-fns$": path.resolve(process.cwd(), "src/lib/date-utils.ts"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Remove TraceEntryPointsPlugin — it generates .nft.json files only needed
    // for output:'standalone'. On Hostinger (full node_modules deployment) it is
    // unnecessary, and its @vercel/nft directory-crawl with moduleSyncCatchall
    // causes OOM (262k files scanned) on Windows/Webpack builds.
    if (isServer) {
      config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== "TraceEntryPointsPlugin"
      );
    }

    return config;
  },
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
