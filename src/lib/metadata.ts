/*import { headers } from "next/headers";
import type { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  path?: string;
  imageUrl?: string;
  keywords?: string | string[];
}

/*
export const metadata = generateMetadata({
  title: "Inevitable Protocol | About",
  description: "Learn more about our mission to build the future.",
  path: "/about",
  imageUrl: "/assets/img/branding/about_banner.png",
  keywords: ["Inevitable Protocol", "About", "Mission"],
});
* /

export async function generateMetadata({
  title = "Inevitable Protocol",
  description = "Begin your journey. Build the future of life—together.",
  path = "/",
  imageUrl,
  keywords = "Inevitable, Inevitable Protocol",
}: MetadataProps = {}): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const url = new URL(path, origin);
  const imagePath = "/assets/img/branding/seo_banner.png";

  let imgUrl;
  if (!imageUrl) {
    imgUrl = `${origin}${imagePath}`;
  } else {
    imgUrl = imageUrl;
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      siteName: "Inevitable Protocol",
      images: [
        {
          url: imgUrl,
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: "/manifest/manifest.json",
    keywords,
  };
}*/

export const metadata = {
  keywords: "Inevitable, Inevitable Protocol, Inevitable Sciences",
  manifest: "/manifest.json",
  description: "Begin your journey. Build the future of life—together.",
  siteName: "Inevitable Protocol",
};