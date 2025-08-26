"use client";

import React, { useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import PartnersComponent from "./PartnersComponent";
import articleSchema, { Article } from "@/app/articles/Articles";
import DynamicArticleCarousel from "@/app/articles/ArticleCarousel";

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

const ArticleCarousel: React.FC<PropType> = ({ options = DEFAULT_OPTIONS }) => {
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
    <section className="w-full mx-auto">

      <div className="ctWrapper">
        <DynamicArticleCarousel category="Trending Articles" slides={trendingSlides} />
      </div>

      <div
        className="absolute z-[-10] max-w-screen hidden md:flex justify-center items-center overflow-hidden"
        style={{ transform: "translateY(-40%)" }}
      >
        {/* Left cloud - shifted slightly right */}
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bg_1.webp"
          style={{ transform: "translateX(-25%)" }}
          alt=""
        />

        {/* Right cloud - shifted slightly left */}
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bg_3.webp"
          style={{ transform: "translateX(25%)" }}
          alt=""
        />
      </div>


      <PartnersComponent />
    </section>
  );
};

export default ArticleCarousel;