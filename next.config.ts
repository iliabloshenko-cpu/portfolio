import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH?.trim();

const nextConfig: NextConfig = {
  output: "export",           // Статическая генерация для GitHub Pages
  images: {
    unoptimized: true,        // GitHub Pages не поддерживает оптимизацию изображений
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath || "",
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
