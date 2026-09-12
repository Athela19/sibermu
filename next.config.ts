import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'standalone' wajib agar Dockerfile runner Alpine bisa copy .next/standalone
  // Hasil: image produksi jauh lebih ringan.
  output: "standalone",
};

export default nextConfig;
