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
    title: "Vision | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Vision | Inevitable Science",
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
      title: "Vision | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: [
        "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
      ],
    },
    manifest: metadata.manifest,
  };
}

export default function Vision() {
  return (
    <div>
      <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden bg-[url('https://cdn.inevitable.science/static/img/vision_hero_scene.webp')] mask-[linear-gradient(to_bottom,black_0%,black_90%,transparent_100%)] bg-cover bg-position-[calc(50%+80px)_center] sm:h-screen sm:min-h-[750px] sm:items-end sm:bg-center">
        <div className="ctWrapper relative top-[15px] flex flex-col items-center">
          <div className="font-optima mb-8 flex flex-col items-center text-center">
            <p className="text-lg uppercase">It Is Inevitable</p>
            <h2 className="text-4xl font-light sm:text-7xl">
              The Future Is Not Found. <br />
              <span className="text-primary">It&rsquo;s Built.</span>
            </h2>
          </div>

          <img
            src="https://cdn.inevitable.science/static/img/hero.webp"
            className="hidden h-[55vh] object-contain select-none sm:block sm:min-h-[400px]"
            height={600}
            width={290}
            alt="Hero Image"
          />
        </div>
      </div>

      <section className="mt-24">
        <h2 className="ctWrapper text-xl md:text-3xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </h2>

        <div
          className="s absolute -z-10 hidden max-w-screen items-center justify-center gap-[70vw] overflow-hidden sm:flex"
          style={{ transform: "translateY(-50%)" }}
        >
          {/* Left cloud */}
          <img
            className="-z-10 w-screen select-none"
            src="https://cdn.inevitable.science/static/img/clouds/cloud_bg_1.webp"
            style={{ transform: "translateX(25%)" }}
            alt=""
          />

          {/* Right cloud */}
          <img
            className="-z-10 w-screen select-none"
            src="https://cdn.inevitable.science/static/img/clouds/cloud_bg_3.webp"
            style={{ transform: "translateX(-25%)" }}
            alt=""
          />
        </div>

        <div className="ctWrapper">
          <div className="my-24 flex flex-col gap-4 md:flex-row md:gap-12">
            <div className="flex flex-col gap-4 sm:min-w-[470px]">
              <h3 className="text-5xl font-extralight">
                This Is Where The
                <span className="text-primary"> Impossible </span>
                Begins.
              </h3>
            </div>

            <div className="text-base font-light md:text-sm lg:text-2xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
          </div>

          <div className="mb-24 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
            <div className="">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
            <div className="">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
            <div className="">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
