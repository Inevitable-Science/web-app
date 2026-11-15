import { Metadata } from "next";
import { Download } from "lucide-react";
import { metadata as siteMetadata } from "@/lib/metadata";


export const revalidate = false;

const url = new URL("/whitepaper", siteMetadata.siteUrl);

export const metadata: Metadata = {
  title: "Whitepaper | Inevitable Science",
  description: siteMetadata.description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: "Whitepaper | Inevitable Science",
    description: siteMetadata.description,
    siteName: siteMetadata.siteName,
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
    description: siteMetadata.description,
    card: "summary_large_image",
    images: [
      "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
    ],
  },
};

export default function WhitePaperPage() {
  return (
    <>
    <div className="ctWrapper mt-32">
      <h1 className="text-primary text-3xl font-extralight sm:text-5xl">
        The Inevitable Whitepaper
      </h1>

      <a
        className="flex items-center my-8 gap-2 cursor-pointer text-lg transition-all hover:text-primary hover:underline"
        href="/assets/inevitable_whitepaper.pdf"
        download
      >
        <span>
          Download{" "}
          <span className="text-primary">
            inevitable_whitepaper.pdf
          </span>
        </span>
        <Download
          size={18}
          className="text-primary"
        />
      </a>

      <div className="w-full h-screen max-h-[2400px] max-w-[] rounded-lg">
        <iframe
          src="/assets/inevitable_whitepaper.pdf"
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
