import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@multiversx/sdk-dapp",
    "@multiversx/sdk-core",
    "@multiversx/sdk-extension-provider",
    "@multiversx/sdk-hw-provider"
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        buffer: require.resolve('buffer/'),
      };
    }
    return config;
  },
};

export default nextConfig;
