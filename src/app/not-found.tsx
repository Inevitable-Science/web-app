import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "Page Not Found | Inevitable Protocol", 
    description: metadata.description,
    alternates: {
      canonical: url, 
    },
    openGraph: {
      title: "Page Not Found | Inevitable Protocol", 
      description: metadata.description, 
      siteName: metadata.siteName, 
      images: [
        {
          url: imgUrl, 
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "Page Not Found | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
  };
}

export default function NotFound() {
  return (
    <div className="text-white text-center h-screen flex items-center justify-center flex-col">
      <div className="flex gap-2 items-center">
        <h1 className="text-5xl font-semibold">404</h1>
        <div className="border-l border-color h-16 w-1" />
        <p>Page Not Found</p>
      </div>

      <style>{`
      footer{
        display: none !important;
      }
      `}</style>
    </div>
  );
}
