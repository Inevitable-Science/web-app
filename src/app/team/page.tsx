import TeamComponent from "./TeamComponent";
import PartnersComponent from "@/components/home/PartnersComponent";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "Team | Inevitable Protocol", 
    description: metadata.description,
    alternates: {
      canonical: url, 
    },
    openGraph: {
      title: "Team | Inevitable Protocol", 
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
      title: "Team | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
    keywords: metadata.keywords, 
  };
}

export default function Team() {
  return (
    <div>
      <div className="absolute inset-0 bg-[url('/assets/img/team/team_bg_image.png')] bg-cover w-full bg-center z-[-10]"></div>
      <section className="ctWrapper mt-[140px]">
        <div className="flex gap-4 flex-col md:flex-row md:gap-12 mb-[52px]">
          <div className="sm:min-w-[400px] flex flex-col gap-4">
            <h3 className="text-5xl font-extralight">Meet the <span className="text-primary">Inevitable</span> team.</h3>
          </div>

          <div className="lg:text-xl md:text-sm font-light text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
        </div>

        {/*<TeamCarousel />*/}
        <TeamComponent />

        <div className="my-48">
          <PartnersComponent />
        </div>
      </section>
    </div>
  );
}