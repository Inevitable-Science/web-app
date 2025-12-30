import TeamComponent from "./TeamComponent";
import PartnersComponent from "@/components/home/PartnersComponent";

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
    title: "Team | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Team | Inevitable Science",
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
      title: "Team | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: [
        "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
      ],
    },
    manifest: metadata.manifest,
  };
}

export default function Team() {
  return (
    <div>
      <div className="absolute inset-0 -z-10 w-full bg-[url('https://cdn.inevitable.science/static/img/team/team_bg_image.webp')] bg-cover bg-center"></div>
      <section className="ctWrapper mt-[140px]">
        <div className="mb-[52px] flex flex-col gap-4 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 sm:min-w-[400px]">
            <h3 className="text-5xl font-extralight">
              Meet the <span className="text-primary">Inevitable</span> team.
            </h3>
          </div>

          <div className="text-base font-light md:text-sm lg:text-xl">
            The Inevitable team has collectively launched 5 DAOs, co-founded 36
            companies, and achieved 10 successful exits, securing capital in
            excess of $300 million, with an additional $10 million raised for
            DeSci initiatives.
          </div>
        </div>

        <TeamComponent />

        <div className="my-48">
          <PartnersComponent />
        </div>
      </section>
    </div>
  );
}
