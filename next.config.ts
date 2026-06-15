import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita che Next inferisca una workspace root errata per via di lockfile esterni
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
