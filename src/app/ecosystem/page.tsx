import PlaceholderActivityGraph from "./DummyChart";
import ClientTable from "./ClientTable";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"

// DATA_TODO: Will need to consolidate, need to route data to this page. Will talk about this later down the line...

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "Ecosystem | Inevitable Protocol",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Ecosystem | Inevitable Protocol",
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
      title: "Ecosystem | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
  };
}

export default function Ecosystem() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[url('/assets/img/ecosystem_backdrop.webp')] bg-cover w-full bg-center z-[-1] top-[-140px]" />

      <section className="ctWrapper mt-[140px]">
        <div className="flex gap-4 flex-col md:flex-row md:gap-12 mb-[52px]">
          <div className="sm:min-w-[400px] flex flex-col gap-4">
            <h3 className="text-5xl font-extralight">
              The Inevitable
              <span className="text-primary">
                {" "}Ecosystem
              </span>
            </h3>
          </div>

          <div className="lg:text-xl text-md font-light">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
          </div>
        </div>


        <div className="flex flex-col gap-[12px]">
          <div className="lg:grid gap-3 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] flex flex-col items-center">
            <div className="bg-grey-450 flex flex-col gap-[12px] p-[12px] w-full rounded-2xl uppercase">
              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  0
                </h3>
                <p className="text-muted-foreground font-light">
                  Token Marketcap
                </p>
              </div>

              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  0
                </h3>
                <p className="text-muted-foreground font-light">
                  Total Project Funding
                </p>
              </div>

              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  0
                </h3>
                <p className="text-muted-foreground font-light">
                  Ecosystem Token Holders
                </p>
              </div>

              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  0
                </h3>
                <p className="text-muted-foreground font-light">
                  Community Size
                </p>
              </div>
            </div>

            <div className="bg-grey-450 flex flex-col justify-center h-full gap-[12px] p-[12px] w-full rounded-2xl">
              <PlaceholderActivityGraph />
            </div>
          </div>


          <ClientTable />

        </div>
      </section>
    </div>
  );
}