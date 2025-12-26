import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  return {
    title: "Page Not Found | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
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
      url: url,
      type: "website",
    },
    twitter: {
      title: "Page Not Found | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: ["https://cdn.inevitable.science/static/img/branding/seo_banner.png"],
    },
    manifest: metadata.manifest,
  };
}

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center text-white">
      <div className="flex items-center gap-2">
        <h1 className="text-5xl font-semibold">404</h1>
        <div className="border-color h-16 w-1 border-l" />
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
