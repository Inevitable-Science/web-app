/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },

  // review this (serverExternalPackages)
  // error within upgrade from next 16.02 -> 16.0.7 
  // https://github.com/vercel/next.js/issues/86099
  // serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'], 
  // this was commented when upgrading next to 16.1.1, review if this can be removed
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all hosts
        port: "",
        pathname: "**", // allow all paths
      },
    ],
    unoptimized: false,
  },
};
