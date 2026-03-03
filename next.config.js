// the main common security headers
const baseSecurityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Isolates the browsing context exclusively to same-origin documents.
  // Cross-origin documents are not loaded in the same browsing context.
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];
const articlesAllowedDomains =
  "https://*.spotify.com/ https://spotify.com https://*.youtube.com/ https://youtube.com https://*.twitter.com/ https://twitter.com";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  experimental: {},
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.publicworks.art",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "testnetmetadata.publicworks.art",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "metadata.publicworks.art",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            //todo this mightbe the problem!
            value: `frame-ancestors 'self'; frame-src ${process.env.NEXT_PUBLIC_IPFS_GATEWAY_SAFE} ${articlesAllowedDomains} 'self';`,
          },
          ...baseSecurityHeaders,
        ],
      },
      {
        source: "/sandbox/worker.js",
        headers: [
          {
            key: "service-worker-allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/sandbox/preview.html",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  transpilePackages: ["@publicworks.art/db-typeorm"],
  redirects() {
    return [
      process.env.MAINTENANCE_MODE === "1"
        ? {
            source: "/((?!maintenance).*)",
            destination: "/maintenance",
            permanent: false,
          }
        : null,
    ].filter(Boolean);
  },
};
const analyze = process.env.ANALYZE === "true";
let withBundleAnalyzer;
if (analyze) {
  withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
  });
} else {
  withBundleAnalyzer = (x) => x;
}

module.exports = withBundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below
