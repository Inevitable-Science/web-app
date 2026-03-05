import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inevitable Science",
    short_name: "Inevitable",
    description: "Begin your journey. Build the future of life—together.",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "https://cdn.inevitable.science/static/img/branding/manifest/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://cdn.inevitable.science/static/img/branding/manifest/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#121212",
    background_color: "#121212",
    display: "standalone",
  };
}
