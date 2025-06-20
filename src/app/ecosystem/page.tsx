import PlaceholderActivityGraph from "./DummyChart";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

const dummyStats = [
  { name: "HydraDAO", logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg" },
  { name: "CryoDAO", logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg" },
  { name: "Erectus", logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg" },
  { name: "MoonDAO", logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg" },
  { name: "Stasis", logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg" },
];

// DATA_TODO: Will need to consolidate, need to route data to this page. Will talk about this later down the line...

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
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
    keywords: metadata.keywords, 
  };
}

export default function Ecosystem() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[url('/assets/img/ecosystem_backdrop.png')] bg-cover w-full bg-center z-[-1] top-[-140px]" />
      
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

          <div className="lg:text-xl md:text-sm font-light text-base">
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

            <div className="bg-grey-450 flex flex-col gap-[12px] p-[12px] w-full rounded-2xl">
              <PlaceholderActivityGraph />
            </div>
          </div>


          <div className="bg-grey-450 flex flex-col gap-[12px] p-[12px] rounded-2xl">
            <h3 className="text-xl">Projects</h3>

            <div className="background-color p-[8px] rounded-xl font-light">
              {dummyStats.map((project, index) => (
                <div key={index} className="border-b border-grey-500">
                  <div
                    className="md:grid md:grid-cols-[auto_3fr_3fr_2fr_4fr_auto] flex justify-between items-center gap-4 py-2 items-center"
                  >
                    <div className="py-2 flex items-center gap-2 w-[170px] lg:w-[225px]">
                      <img
                        src={project.logo}
                        alt={project.name}
                        className="w-8 h-8"
                      />
                      <h4 className="text-lg pl-2">
                        {project.name}
                      </h4>
                    </div>

                    <div className="md:flex flex-col gap-1 hidden">
                      <span className="text-grey-50 text-sm">
                        AMOUNT
                      </span>
                      0
                    </div>

                    <div className="md:flex flex-col gap-1 hidden">
                      <span className="text-grey-50 text-sm">
                        vAMOUNT
                      </span>
                      0
                    </div>

                    <div className="md:flex flex-col gap-1 hidden">
                      <span className="text-grey-50 text-sm">
                        PRICE
                      </span>
                      0
                    </div>

                    <div className="md:flex flex-col gap-1 hidden">
                      <span className="text-grey-50 text-sm">
                        LIQUID VALUE
                      </span>
                      0
                    </div>

                    <button className="focus:outline-none py-[6px] px-[12px] rounded-full bg-gunmetal font-normal">
                      <Link href="/eth:64" className="flex items-center gap-2">
                        Invest
                        <ArrowRightIcon height="18" width="18" />
                      </Link>
                    </button>
                  </div>

                  <div className="md:hidden grid grid-cols-[2fr_2fr_3fr] gap-4 items-center mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-grey-50 text-sm">
                        AMOUNT
                      </span>
                      0
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-grey-50 text-sm">
                        vAMOUNT
                      </span>
                      0
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-grey-50 text-sm">
                        LIQUID VALUE
                      </span>
                      0
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}