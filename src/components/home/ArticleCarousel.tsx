"use client";

import React, { useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import PartnersComponent from "./PartnersComponent";
import articleSchema, { Article } from "@/app/articles/Articles";
import { DynamicArticleCarousel } from "@/app/articles/ArticleCarousel";

type SlideType = {
  img: string;
  title: string;
  description: string;
};

type PropType = {
  slides?: SlideType[];
  options?: EmblaOptionsType;
};

const DEFAULT_OPTIONS: EmblaOptionsType = { align: "start" };

export default function ArticleCarousel({
  options = DEFAULT_OPTIONS,
}: PropType) {
  const [trendingSlides, setTrendingSlides] = useState<SlideType[]>([]);

  useEffect(() => {
    const sortedArticles = [...articleSchema.articles].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const slides = sortedArticles.slice(0, 3).map((article: Article) => ({
      img: article.image,
      title: article.title,
      description: article.overview,
    }));

    setTrendingSlides(slides);
  }, []);

  return (
    <section className="mx-auto w-full">
      <div className="ctWrapper">
        <DynamicArticleCarousel
          category="Trending Articles"
          slides={trendingSlides}
        />
      </div>

      <div
        className="max-w-screen absolute z-[-10] hidden items-center justify-center overflow-hidden md:flex"
        style={{ transform: "translateY(-40%)" }}
      >
        {/* Left cloud - shifted slightly right */}
        <img
          className="z-[-10] w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/cloud_bg_1.webp"
          style={{ transform: "translateX(-25%)" }}
          alt=""
        />

        {/* Right cloud - shifted slightly left */}
        <img
          className="z-[-10] w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/cloud_bg_3.webp"
          style={{ transform: "translateX(25%)" }}
          alt=""
        />
      </div>

      <PartnersComponent />
    </section>
  );
}
