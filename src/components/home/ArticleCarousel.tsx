'use client';

import React from 'react';
import Image from 'next/image';
import { EmblaOptionsType } from 'embla-carousel';
import { PrevButton, NextButton, usePrevNextButtons } from './ArrowButtons';
import PartnersComponent from './PartnersComponent';
import useEmblaCarousel from 'embla-carousel-react';
import articleSchema, { Article } from "@/app/articles/Articles";

type SlideType = {
  img: string;
  title: string;
  description: string;
};

type PropType = {
  slides?: SlideType[];
  options?: EmblaOptionsType;
};

const DEFAULT_SLIDES: SlideType[] = [
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

const DEFAULT_OPTIONS: EmblaOptionsType = { align: 'start' };

const ArticleCarousel: React.FC<PropType> = ({ slides = DEFAULT_SLIDES, options = DEFAULT_OPTIONS }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  // Sort articles by date (latest first) on server
  const sortedArticles = [...articleSchema.articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get trending slides (latest 3 articles)
  const trendingSlides = sortedArticles
    .slice(0, 3)
    .map((article: Article) => ({
      img: article.image,
      title: article.title,
      description: article.overview,
    }));

  const uniqueCategories = Array.from(
    new Set(sortedArticles.flatMap((article) => article.category))
  ).slice(0, 14); // Limit to 14 categories

  const categorySlides = uniqueCategories.map((category) => ({
    category,
    slides: sortedArticles
      .filter((article) => article.category.includes(category))
      .map((article: Article) => ({
        img: article.image,
        title: article.title,
        description: article.overview,
      })),
  }));


  return (
    <section className="w-full mx-auto">

      <div className="ctWrapper">
        <div className="flex justify-between items-center mb-4">
          <h3 className="sm:text-4xl text-2xl font-extralight">Trending articles</h3>
          <div className="flex gap-4 items-center">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {trendingSlides.map((slide, index) => (
              <div key={index} className="flex min-w-[280px] sm:min-w-[440px] pl-4">
                <div className="flex flex-col items-start h-full p-4 bg-background border border-grey-500 rounded-2xl select-none">
                  <Image
                    src={slide.img}
                    alt={slide.title}
                    height={220}
                    width={390}
                    className="object-cover object-contain rounded-lg w-full h-auto"
                  />
                  <div>
                    <h4 className="text-xl font-optima mt-2">{slide.title}</h4>
                    <p className="text-sm font-light line-clamp-2">{slide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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