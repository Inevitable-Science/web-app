import { Metadata } from "next";
import { headers } from "next/headers";
import { Download } from "lucide-react";
import { metadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  return {
    title: "Whitepaper | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Whitepaper | Inevitable Science",
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
      title: "Whitepaper | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: [
        "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
      ],
    },
  };
}

export default function WhitePaperPage() {
  return (
    <>
    <div className="ctWrapper mt-32">
      <h1 className="text-primary text-3xl font-extralight sm:text-5xl">
        The Inevitable Whitepaper
      </h1>

      <a
        className="flex items-center my-8 gap-2 cursor-pointer text-lg transition-all hover:text-primary hover:underline"
        href="/assets/inevitable_whitepaper_Q1-2026.pdf"
        download
      >
        <span>
          Download{" "}
          <span className="text-primary">
            inevitable_whitepaper_Q1-2026.pdf
          </span>
        </span>
        <Download
          size={18}
          className="text-primary"
        />
      </a>

      <div className="w-full h-screen max-h-[2400px] max-w-[] rounded-lg">
        <iframe
          src="/assets/inevitable_whitepaper_Q1-2026.pdf"
          className="rounded-md"
          title="Inevitable Whitepaper"
          height="100%"
          width="100%"
        />
      </div>
    </div>
    </>
  )
}
