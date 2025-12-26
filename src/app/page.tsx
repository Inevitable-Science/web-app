import Image from "next/image";
import Link from "next/link";

import ExploreButton from "@/components/home/ExploreButton";
import ArticleCarousel from "@/components/home/ArticleCarousel";
import DaosGrid from "@/components/home/DaosGrid";
import AuctionComponent from "@/components/home/AuctionComponent";

import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata";
import { ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  return {
    title: "Inevitable Science | Home",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Inevitable Science | Home",
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
      title: "Inevitable Science | Home",
      description: metadata.description,
      card: "summary_large_image",
      images: ["https://cdn.inevitable.science/static/img/branding/seo_banner.png"],
    },
    manifest: metadata.manifest,
  };
}

export default function Page() {
  return (
    <div>
      {/*<div className="bg-[url('/assets/img/home_landing.webp')] bg-cover bg-position-[calc(50%+80px)_center] sm:bg-center relative h-[500px] sm:h-[110vh] w-full overflow-hidden mask-[linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)]">*/}
      <div className="relative h-[500px] w-full overflow-hidden mask-[linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)] sm:h-[110vh]">
        {/* Background Video */}
        <video
          className="absolute inset-0 h-full w-full object-cover object-[calc(50%+80px)_center] sm:object-center"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src="https://cdn.inevitable.science/static/img/layout/home_hero_main.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <div className="gap-38 absolute bottom-[40px] z-10 flex w-full flex-col sm:bottom-[25vh]">
          <div className="mx-auto flex max-w-full flex-col gap-4 px-[24px] sm:w-[1600px]">
            <h1 className="text-center font-optima text-6xl sm:text-left">
              DeSci is Inevitable.
            </h1>
            <h4 className="text-center text-2xl font-extralight sm:text-left sm:text-3xl">
              We’re building the critical infrastructure to fund technological
              breakthroughs.
            </h4>

            <ExploreButton />
          </div>
        </div>
      </div>

      <div className="relative top-0 sm:top-[-10vh]">
        <div className="ctWrapper mb-16 flex flex-col gap-4 md:flex-row md:gap-0">
          <div className="flex flex-col gap-4 sm:min-w-[470px]">
            <h3 className="text-5xl font-extralight">
              This Is Where The <span className="text-primary">Impossible</span>{" "}
              Begins.
            </h3>
            <a
              href="https://discord.com/invite/inevitable"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our discord server"
              className="flex w-fit items-center gap-3 font-medium uppercase transition-[gap] duration-150 hover:gap-5 hover:underline"
            >
              Apply To Inevitable
              <ArrowRight height={20} width={20} />
            </a>
          </div>

          <div className="text-base font-light md:text-sm lg:text-xl">
            Inevitable’s mission is to accelerate exponential technologies for
            the benefit of mankind. Such DAOs fund and implement heavily-vetted
            frontier research to deliver it to the user or patient in the
            shortest time possible. DAOs may employ revenue-generating
            mechanisms by selling IP, products, processes, machines, designs, or
            advice that demonstrably improve or enhance the human condition.
          </div>
        </div>

        <div className="md:mx-auto md:max-w-[1600px] md:px-[24px]">
          <AuctionComponent />
        </div>

        <div className="relative">
          <img
            className="sm-translate-up absolute left-1/2 top-0 -z-10 w-full max-w-[1500px] select-none overflow-hidden"
            src="https://cdn.inevitable.science/static/img/fog_bg.webp"
            alt=""
          />

          <div className="relative my-16 text-center sm:my-32">
            <p className="mb-2 font-optima text-xl uppercase text-primary">
              Discover DAO&rsquo;S
            </p>
            <h3 className="text-4xl font-light sm:text-6xl">
              Enter the Stack <br />
              Where <span className="text-primary"> Life Evolves.</span>
            </h3>

            <div className="pointer-events-none absolute top-0 hidden w-full items-center justify-between overflow-hidden sm:flex">
              <img
                className="-z-10 select-none overflow-hidden"
                src="https://cdn.inevitable.science/static/img/clouds/cloud_left.webp"
                style={{ transform: "translateX(-40%) translateY(-15%)" }}
                alt=""
              />

              <img
                className="relative -z-10 select-none overflow-hidden"
                src="https://cdn.inevitable.science/static/img/clouds/cloud_right.webp"
                style={{ transform: "translateX(40%)" }}
                alt=""
              />
            </div>
          </div>

          <DaosGrid />
        </div>

        <section className="mb-[60px] mt-[40px] flex h-screen min-h-[500px] items-center justify-center rounded-2xl bg-[url('https://cdn.inevitable.science/static/img/light_future.webp')] bg-cover bg-center mask-[linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] sm:items-end">
          <div className="ctWrapper relative top-[15px] flex flex-col items-center">
            <div className="flex flex-col items-center gap-6 text-center">
              <Image
                alt="Icon Logo"
                src="https://cdn.inevitable.science/static/img/branding/icon.svg"
                height="70"
                width="35"
              />

              <div>
                <p className="font-optima text-lg uppercase">
                  It Is Inevitable
                </p>
                <h2 className="text-4xl font-light sm:text-7xl">
                  The Future Is Not Found. <br />
                  <span className="text-primary">It&rsquo;s Built.</span>
                </h2>
              </div>

              <Button
                variant={"accent"}
                className="w-full rounded-full px-10 font-medium uppercase sm:w-fit"
              >
                <Link href="/vision">Our Vision</Link>
              </Button>
            </div>

            <img
              className="pointer-events-none relative top-[-10px] hidden h-[40vh] sm:block"
              src="https://cdn.inevitable.science/static/img/hero.webp"
              alt="Hero Image"
            />
          </div>
        </section>

        <ArticleCarousel />
      </div>

      <style>{`
      @media (min-width: 640px) {
        .sm-translate-up {
          transform: translate(-50%, -60%);
        }
      }

      @media (max-width: 640px) {
        .sm-translate-up {
          transform: translate(-50%, -38%);
        }
      }
      `}</style>
    </div>
  );
}
