"use client";

import { EmblaOptionsType } from "embla-carousel";
import PartnersComponent from "./PartnersComponent";
import { DynamicArticleCarousel } from "@/app/articles/ArticleCarousel";
import { useFetchLatestArticles } from "@/hooks/queries/articles/useFetchLatestArticles";
import { LatestArticlesResponse } from "@/lib/types/PublicArticleTypes";

export default function ArticleCarousel() {
  const { data: slides } = useFetchLatestArticles();

  return (
    <section className="mx-auto w-full">
      <div className="ctWrapper">
        {slides ? (
          <DynamicArticleCarousel category="Latest Articles" slides={slides} />
        ) : (
          <div className="overflow-hidden">
            <h3 className="mb-4 text-2xl font-extralight sm:text-4xl">
              Latest Articles
            </h3>
            <div className="flex gap-4 overflow-hidden">
              <div className="bg-background border-color flex h-[340px] min-w-[420px] flex-col items-start rounded-2xl border p-4 select-none">
                <div className="activeSkeleton h-full w-full rounded-lg object-cover" />

                <div className="mt-4 w-full">
                  <div className="activeSkeleton h-[28px] w-[60%] rounded-lg" />

                  <div className="activeSkeleton my-2 h-[18px] w-full rounded-lg" />
                  <div className="activeSkeleton h-[18px] w-full rounded-lg" />
                </div>
              </div>

              <div className="bg-background border-color flex h-[340px] min-w-[420px] flex-col items-start rounded-2xl border p-4 select-none">
                <div className="activeSkeleton h-full w-full rounded-lg object-cover" />

                <div className="mt-4 w-full">
                  <div className="activeSkeleton h-[28px] w-[60%] rounded-lg" />

                  <div className="activeSkeleton my-2 h-[18px] w-full rounded-lg" />
                  <div className="activeSkeleton h-[18px] w-full rounded-lg" />
                </div>
              </div>

              <div className="bg-background border-color flex h-[340px] min-w-[420px] flex-col items-start rounded-2xl border p-4 select-none">
                <div className="activeSkeleton h-full w-full rounded-lg object-cover" />

                <div className="mt-4 w-full">
                  <div className="activeSkeleton h-[28px] w-[60%] rounded-lg" />

                  <div className="activeSkeleton my-2 h-[18px] w-full rounded-lg" />
                  <div className="activeSkeleton h-[18px] w-full rounded-lg" />
                </div>
              </div>

              <div className="bg-background border-color flex h-[340px] min-w-[420px] flex-col items-start rounded-2xl border p-4 select-none">
                <div className="activeSkeleton h-full w-full rounded-lg object-cover" />

                <div className="mt-4 w-full">
                  <div className="activeSkeleton h-[28px] w-[60%] rounded-lg" />

                  <div className="activeSkeleton my-2 h-[18px] w-full rounded-lg" />
                  <div className="activeSkeleton h-[18px] w-full rounded-lg" />
                </div>
              </div>

              <div className="bg-background border-color flex h-[340px] min-w-[420px] flex-col items-start rounded-2xl border p-4 select-none">
                <div className="activeSkeleton h-full w-full rounded-lg object-cover" />

                <div className="mt-4 w-full">
                  <div className="activeSkeleton h-[28px] w-[60%] rounded-lg" />

                  <div className="activeSkeleton my-2 h-[18px] w-full rounded-lg" />
                  <div className="activeSkeleton h-[18px] w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="absolute -z-10 hidden max-w-screen items-center justify-center overflow-hidden md:flex"
        style={{ transform: "translateY(-40%)" }}
      >
        {/* Left cloud - shifted slightly right */}
        <img
          className="-z-10 w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/cloud_bg_1.webp"
          style={{ transform: "translateX(-25%)" }}
          alt=""
        />

        {/* Right cloud - shifted slightly left */}
        <img
          className="-z-10 w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/cloud_bg_3.webp"
          style={{ transform: "translateX(25%)" }}
          alt=""
        />
      </div>

      <PartnersComponent />
    </section>
  );
}
