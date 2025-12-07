/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'], // review this -> error within upgrade from next 16.02 -> 16.0.7
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
