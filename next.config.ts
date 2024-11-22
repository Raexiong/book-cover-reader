import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // https://nextjs.org/docs/app/api-reference/next-config-js/serverExternalPackages
  serverExternalPackages: ["@huggingface/transformers"],
  webpack: (config) => {
    config.resolve.alias["@huggingface/transformers"] = path.resolve(
      __dirname,
      "node_modules/@huggingface/transformers"
    );

    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };

    return config;
  },
};

export default nextConfig;
