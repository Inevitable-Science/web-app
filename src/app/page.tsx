import Image from "next/image";
import Link from "next/link";

import ArticleCarousel from "@/components/home/ArticleCarousel";
import DaosGrid from "@/components/home/DaosGrid";
import AuctionComponent from "@/components/home/AuctionComponent";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

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
    title: "Inevitable Protocol | Home", 
    description: metadata.description,
    alternates: {
      canonical: url, 
    },
    openGraph: {
      title: "Inevitable Protocol | Home", 
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
      title: "Inevitable Protocol | Home",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
  };
}

const SLIDES = [
  {
    img: '/assets/img/articles/article_1.webp',
    title: 'Article Title 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
  {
    img: '/assets/img/articles/article_2.webp',
    title: 'Article Title 2',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
  {
    img: '/assets/img/articles/article_3.webp',
    title: 'Article Title 3',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
  {
    img: '/assets/img/articles/article_4.webp',
    title: 'Article Title 4',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
];

export default function Page() {

  return (
    <div>
      {/*<div className="bg-[url('/assets/img/home_landing.png')] bg-cover bg-[calc(50%+80px)_center] sm:bg-center relative h-[500px] sm:h-[110vh] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)]">*/}
      <div className="relative h-[500px] sm:h-[110vh] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)]">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover object-[calc(50%+80px)_center] sm:object-center"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/assets/img/home-hero-main.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="absolute sm:bottom-[25vh] bottom-[40px] w-full z-10 flex flex-col gap-38">
          <div className="sm:w-[1600px] mx-auto px-[24px] flex flex-col gap-4">
            <h1 className="font-optima text-center text-6xl sm:text-left">DeSci is Inevitable.</h1>
            <h4 className="font-extralight text-2xl text-center sm:text-3xl sm:text-left">We’re building the critical infrastructure to fund technological breakthroughs.</h4>
            <Button variant={"accent"} className="rounded-full px-6 mt-2 sm:w-fit w-full font-medium uppercase">
                Explore Inevitable
            </Button>
          </div>
        </div>
      </div>


      <div className="relative sm:top-[-10vh] top-0">
        <div className="ctWrapper flex gap-4 flex-col md:flex-row md:gap-0 mb-16">
          <div className="sm:min-w-[470px] flex flex-col gap-4">
            <h3 className="text-5xl font-extralight">This Is Where The <span className="text-primary">Impossible</span> Begins.</h3>
            <a 
              href="https://discord.com/invite/inevitable" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Join our discord server" 
              className="flex w-fit gap-3 items-center font-medium uppercase hover:underline transition-[gap] duration-150 hover:gap-5"
            >
              Apply To Inevitable
              <ArrowRightIcon height={20} width={20} />
            </a>
          </div>

          <div className="lg:text-xl md:text-sm font-light text-base">
            Inevitable Protocol runs on a tokenized on-chain protocol coordinating a collection of token nodes whose core design is to automatically funnel real-world revenues back into the ecosystem, ensuring a recurring cash flow. The token nodes - revnets - autonomously operate their economic aspects without human interference: they sell tokens, earn revenues, pay for liabilities such as ecosystem fees and third-party services, and use the revenues to back the token and grow the treasury in a sustainable, circular way.
          </div>
        </div>

        <div className="md:max-w-[1600px] md:mx-auto md:px-[24px]">
          <AuctionComponent />
        </div>


        <div className="relative">
          <img 
            className="absolute left-1/2 top-0 z-[-10] w-full max-w-[1500px] overflow-hidden select-none sm-translate-up" 
            src="/assets/img/fog_bg.webp"
            alt=""
          />

          <div className="relative text-center my-16 sm:my-32">
            <p className="font-optima text-primary text-xl uppercase mb-2">Discover DAO&rsquo;S</p>
            <h3 className="text-4xl sm:text-6xl font-light">
              Enter the Stack <br/>
              Where <span className="text-primary"> Life Evolves.</span>
            </h3>

            <div className="absolute top-0 w-full justify-between items-center overflow-hidden sm:flex hidden">
              <img 
                className="z-[-10] overflow-hidden select-none" 
                src="/assets/img/clouds/cloud_left.webp" 
                style={{ transform: "translateX(-40%) translateY(-15%)" }}
                alt=""
              />

              <img 
                className="z-[-10] relative overflow-hidden select-none" 
                src="/assets/img/clouds/cloud_right.webp" 
                style={{ transform: "translateX(40%)" }}
                alt=""
              />
            </div>
          </div>

          <DaosGrid />
        </div>


        <section className="
          bg-[url('/assets/img/light_future.webp')] bg-cover bg-center h-[100vh] min-h-[500px] rounded-2xl mt-[40px] mb-[60px] flex sm:items-end items-center justify-center
          [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <div className="ctWrapper relative top-[15px] flex flex-col items-center">
            <div className="text-center flex flex-col items-center gap-6">
              <Image alt="Icon Logo" src="/assets/img/branding/icon.svg" height="70" width="35" />

              <div>
                <p className="font-optima uppercase text-lg">It Is Inevitable</p>
                <h2 className="sm:text-7xl text-4xl font-light">
                  The Future Is Not Found. <br/>
                  <span className="text-primary">It&rsquo;s Built.</span>
                </h2>
              </div>

              <Button variant={"accent"} className="rounded-full px-6 sm:w-fit w-full font-medium uppercase px-10">
                  Our Vision
              </Button>
            </div>

            <img className="h-[40vh] sm:block hidden relative top-[-10px]" src="/assets/img/hero.webp" alt="Hero Image" />
            </div>
        </section>

        <ArticleCarousel slides={SLIDES} />
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
