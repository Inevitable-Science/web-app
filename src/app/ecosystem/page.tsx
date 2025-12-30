import PlaceholderActivityGraph from "./DummyChart";
import ClientTable from "./ClientTable";

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
    title: "Ecosystem | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Ecosystem | Inevitable Science",
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
      title: "Ecosystem | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: [
        "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
      ],
    },
    manifest: metadata.manifest,
  };
}

export default function Ecosystem() {
  return (
    <div className="relative">
      <div className="absolute inset-0 top-[-140px] z-[-1] w-full bg-[url('https://cdn.inevitable.science/static/img/ecosystem_backdrop.webp')] bg-cover bg-center" />

      <section className="ctWrapper mt-[140px]">
        <div className="mb-[52px] flex flex-col gap-4 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 sm:min-w-[400px]">
            <h3 className="text-5xl font-extralight">
              The Inevitable
              <span className="text-primary"> Ecosystem</span>
            </h3>
          </div>

          <div className="text-md font-light lg:text-xl">
            Inevitable Protocol runs on a tokenized on-chain protocol
            coordinating a collection of token nodes whose core design is to
            automatically funnel real-world revenues back into the ecosystem,
            ensuring a recurring cash flow. The token nodes, or Revnets,
            autonomously operate their economic aspects without human
            interference.
          </div>
        </div>

        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col items-center gap-3 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <div className="bg-grey-450 flex w-full flex-col gap-[12px] rounded-2xl p-[12px] uppercase">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">0</h3>
                <p className="text-muted-foreground font-light">
                  Token Marketcap
                </p>
              </div>

              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">0</h3>
                <p className="text-muted-foreground font-light">
                  Total Project Funding
                </p>
              </div>

              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">0</h3>
                <p className="text-muted-foreground font-light">
                  Ecosystem Token Holders
                </p>
              </div>

              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">0</h3>
                <p className="text-muted-foreground font-light">
                  Community Size
                </p>
              </div>
            </div>

            <div className="bg-grey-450 flex h-full w-full flex-col justify-center gap-[12px] rounded-2xl p-[12px]">
              <PlaceholderActivityGraph />
            </div>
          </div>

          <ClientTable />
        </div>
      </section>
    </div>
  );
}
