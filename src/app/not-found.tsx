import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
    <section className="ctWrapper pt-12 h-screen bg-[url('https://cdn.inevitable.science/static/img/layout/footer.webp')] bg-cover bg-screen relative mask-[linear-gradient(to_bottom,black_30%,black_90%,transparent_100%)]">
      <div className="flex flex-col">
        <div className="flex uppercase flex-col md:flex-row">
          <h1 className="font-optima text-5xl sm:text-6xl italic">
            Page
          </h1>
          <div className="not-italic md:pt-[3.75rem] flex flex-col inline-block">
            <h1 className="font-optima text-5xl sm:text-6xl">
              Not Found
            </h1>

            <p className="my-8 max-w-[350px] text-wrap">
              Looks like this page wandered off... Try heading back to the homepage to get back on track.
            </p>

            <Button variant={"accent"}>
              <Link href="/" className="flex items-center gap-4">
                Return To Homepage
                <ArrowRight height={18} width={18} />
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-[60vw]">
          <img // use img as Image does not preserve image quality
            src="https://cdn.inevitable.science/static/img/hero.webp"
            alt="Hero Image"
            className="notFoundHero w-[230px] sm:block hidden"
          />
        </div>
      </div>
      <style>{`
      @media (max-height:630px) {
        .notFoundHero {
          display: none;
        }
      }

      nav{
        display: none;
      }

      footer{
        display: none !important;
      }
      `}</style>
    </section>
  );
}
