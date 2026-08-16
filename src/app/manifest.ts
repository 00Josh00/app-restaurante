import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kleta · Restaurante",
    short_name: "Kleta",
    description: "Gestión de pedidos del restaurante",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0908",
    theme_color: "#0b0908",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}