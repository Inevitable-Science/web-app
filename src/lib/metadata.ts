export const metadata = {
  description: "Begin your journey. Build the future of life—together.",
  siteName: "Inevitable Science",
};

export const notFoundMetadata = {
  title: "Page Not Found | Inevitable Science",
  description: metadata.description,
  openGraph: {
    title: "Page Not Found | Inevitable Science",
    description: metadata.description,
    siteName: metadata.siteName,
    images: [
      {
        url: "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
        width: 700,
        height: 370,
        alt: "Inevitable preview image",
      },
    ],
    type: "website",
  },
  twitter: {
    title: "Page Not Found | Inevitable Science",
    description: metadata.description,
    card: "summary_large_image",
    images: [
      "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
    ],
  },
  robots: {
    index: false,
    follow: false,
  }
};