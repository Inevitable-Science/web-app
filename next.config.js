/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },

  // OLD: review this (serverExternalPackages)
  // OLD: error within upgrade from next 16.02 -> 16.0.7 
  // OLD: https://github.com/vercel/next.js/issues/86099
  // OLD: serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'], 
  // OLD: this was commented when upgrading next to 16.1.1, review if this can be removed

  // This was added due to an annoying error
  // Error is due to being unable to update wagmi to the latest version due to peer deps
  // Remove this when wagmi is updated otherwise you will see "Index DB Is Not Def" err (SSR)
  serverExternalPackages: ['wagmi'], 
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
