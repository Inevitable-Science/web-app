
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
    title: "Vision | Inevitable Protocol", 
    description: metadata.description,
    alternates: {
      canonical: url, 
    },
    openGraph: {
      title: "Vision | Inevitable Protocol", 
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
      title: "Vision | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
    keywords: metadata.keywords, 
  };
}

export default function Vision() {
  return (
    <div>
      <div className="
        bg-[url('/assets/img/vision_hero_scene.webp')] bg-cover bg-[calc(50%+80px)_center] sm:bg-center relative h-[500px] sm:h-[100vh] sm:min-h-[750px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)]
        flex sm:items-end items-center justify-center
      ">
        <div className="ctWrapper relative top-[15px] flex flex-col items-center">
          <div className="text-center flex flex-col items-center mb-8 font-optima">
            <p className="uppercase text-lg">It Is Inevitable</p>
            <h2 className="sm:text-7xl text-4xl font-light">
              The Future Is Not Found. <br/>
              <span className="text-primary">It&rsquo;s Built.</span>
            </h2>
          </div>

          <img className="h-[55vh] sm:min-h-[400px] sm:block hidden select-none" src="/assets/img/hero.webp" alt="Hero Image" />
        </div>
      </div>

      <section className="mt-24">
        <h4 className="ctWrapper text-xl md:text-3xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </h4>
        
        <div
          className="s absolute z-[-10] w-screen hidden sm:flex justify-center items-center gap-[70vw] overflow-hidden"
          style={{ transform: 'translateY(-50%)' }}
        >
          {/* Left cloud */}
          <img
            className="z-[-10] select-none w-[100vw]"
            src="/assets/img/clouds/cloud_bg_1.png"
            style={{ transform: 'translateX(25%)' }}
            alt=""
          />

          {/* Right cloud */}
          <img
            className="z-[-10] select-none w-[100vw]"
            src="/assets/img/clouds/cloud_bg_3.png"
            style={{ transform: 'translateX(-25%)' }}
            alt=""
          />
        </div>

        <div className="ctWrapper">
          <div className="flex gap-4 flex-col md:flex-row md:gap-12 my-24">
            <div className="sm:min-w-[470px] flex flex-col gap-4">
              <h3 className="text-5xl font-extralight">
                This Is Where The 
                <span className="text-primary"> Impossible </span> 
                Begins.
              </h3>
            </div>

            <div className="lg:text-2xl md:text-sm font-light text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
          </div>

          <div className="mb-24 grid gap-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <div className="">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
            <div className="">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
            <div className="">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}