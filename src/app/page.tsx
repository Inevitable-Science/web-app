"use client";
import { Button } from "@/components/ui/button";
import { JB_CHAINS } from "juice-sdk-core";
import Image from "next/image";
import Link from "next/link";
import { mainnet } from "viem/chains";
import { sdk } from "@farcaster/frame-sdk";
import { use, useEffect, useState } from "react";

import { Nav } from "@/components/layout/Nav";

import { ArrowRightIcon } from "@heroicons/react/24/outline";

import ArticleCarousel from "@/components/home/ArticleCarousel";
import DaosGrid from "@/components/home/DaosGrid";
import AuctionComponent from "@/components/home/AuctionComponent";

const SLIDES = [
  {
    img: '/assets/img/articles/article_1.png',
    title: 'Article Title 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
  {
    img: '/assets/img/articles/article_2.png',
    title: 'Article Title 2',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
  {
    img: '/assets/img/articles/article_3.png',
    title: 'Article Title 3',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
  {
    img: '/assets/img/articles/article_4.png',
    title: 'Article Title 4',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  },
];

const RevLink = ({
  network,
  id,
  text,
}: {
  network: string;
  id: number;
  text: string;
}) => {
  return (
    <span>
      $
      <Link
        href={`/${network}:${id}`}
        className="underline hover:text-black/70"
      >
        {text}
      </Link>
    </span>
  );
};

const Pipe = () => {
  return <div className="text-zinc-300">{" | "}</div>;
};

export default function Page() {
  const [user, setUser] = useState<{ fid: number; pfp: string, userName: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      await sdk.actions.ready();

      try {
        await sdk.actions.addFrame();
      } catch (error) {
        if (error){
          console.log("User rejected the mini app addition or domain manifest JSON is invalid");
          // Handle the rejection here
        }
      }

      const ctx = (await sdk.context);
      if (ctx?.user) {
        setUser({ fid: ctx.user.fid, pfp: ctx.user.pfpUrl || "", userName: ctx.user.username || "" });
      }
    };
    fetchUser();
  }, []);

  return (
    <>
    {/*
    <div>
      {/*{user?.pfp && (
        <div className="flex items-center mb-4">
          <span className="text-lg">Hello {user.userName}!</span>
        </div>
      )}
      <div className="flex flex-col items-left justify-left">
        <div className="text-xl md:text-2xl mt-8 font-medium text-left">
          Fund radical science.
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex gap-4 mt-8">
            <Link href="/create">
              <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
                Create yours
              </Button>
            </Link>
          </div>
        </div>
      </div>* /}
      <Nav />

      <div>
        <div className="bg-[url('/assets/img/landing-image.png')] bg-cover bg-center h-screen px-12 mb-256">

        <div className="flex flex-col gap-4 absolute bottom-[22vh]">
          <h1 className="font-optima text-6xl">Begin your journey.</h1>
          <h4 className="font-light text-3xl">Build the future of life—together.</h4>
          <Button className="rounded-full bg-primary text-primary-foreground px-6 mt-2 w-fit font-medium uppercase hover:bg-primary/90">
            <Link href="/app" aria-label="Explore Inevitable">
              Explore Inevitable
            </Link>
          </Button>
        </div>
      </div>
    </div>
    </div>*/}

      <div>
        <Nav />

        <div className="bg-[url('/assets/img/home_landing.png')] bg-cover bg-[calc(50%+80px)_center] sm:bg-center relative h-[500px] sm:h-[110vh] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)]">

          <div className="absolute sm:bottom-[25vh] bottom-[40px] w-full z-10 flex flex-col gap-38">
            <div className="sm:w-[1400px] mx-auto px-[24px] flex flex-col gap-4">
              <h1 className="font-optima text-center text-6xl sm:text-left">Begin your journey.</h1>
              <h4 className="font-extralight text-2xl text-center sm:text-3xl sm:text-left">Build the future of life—together.</h4>
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
              <Link href="/apply" aria-label="Apply To Inevitable" className="flex w-fit gap-3 items-center font-medium uppercase hover:underline transition-[gap] duration-150 hover:gap-5">
                Apply To Inevitable
                <ArrowRightIcon height={20} width={20} />
              </Link>
            </div>

            <div className="lg:text-xl md:text-sm font-light text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
          </div>

          <div className="md:max-w-[1400px] md:mx-auto md:px-[24px]">
            <AuctionComponent />
          </div>


          <div className="relative">
            <img 
              className="sm-translate-up absolute -translate-x-1/2 top-0 z-[-10] w-full max-w-[1500px] overflow-hidden select-none" 
              src="/assets/img/fog_bg.png"
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
                  src="/assets/img/clouds/cloud_left.png" 
                  style={{ transform: "translateX(-40%) translateY(-15%)" }}
                />

                <img 
                  className="z-[-10] relative overflow-hidden select-none" 
                  src="/assets/img/clouds/cloud_right.png" 
                  style={{ transform: "translateX(40%)" }}
                />
              </div>
            </div>

            <DaosGrid />
          </div>


          <section className="
            bg-[url('/assets/img/light_future.png')] bg-cover bg-center h-[100vh] min-h-[500px] rounded-2xl mt-[40px] mb-[60px] flex sm:items-end items-center justify-center
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

              <img className="h-[40vh] sm:block hidden relative top-[-10px]" src="/assets/img/hero.png" />
              </div>
          </section>

          <ArticleCarousel slides={SLIDES} />
        </div>


        <style>{`
        @media (min-width: 640px) {
          .sm-translate-up {
            transform: translateY(-60%);
          }
        }
        
        @media (max-width:640px){
          .sm-translate-up {
            transform: translateY(-38%);
          }
        }
        `}</style>
      </div>
    </>
  );
}
