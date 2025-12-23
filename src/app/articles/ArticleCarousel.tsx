"use client";

import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "@/components/home/ArrowButtons";
import useEmblaCarousel from "embla-carousel-react";

interface SlideType {
  img: string;
  title: string;
  description: string;
}

interface Props {
  category?: string;
  slides?: SlideType[];
  options?: EmblaOptionsType;
}

const DEFAULT_SLIDES: SlideType[] = [
  {
    img: "https://cdn.inevitable.science/static/img/articles/article_1.png",
    title: "Article Title 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    img: "https://cdn.inevitable.science/static/img/articles/article_2.png",
    title: "Article Title 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    img: "https://cdn.inevitable.science/static/img/articles/article_3.png",
    title: "Article Title 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    img: "https://cdn.inevitable.science/static/img/articles/article_4.png",
    title: "Article Title 4",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
];

const DEFAULT_OPTIONS: EmblaOptionsType = { align: "start" };

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");

export function DynamicArticleCarousel({
  category = "Category",
  slides = DEFAULT_SLIDES,
  options = DEFAULT_OPTIONS,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-extralight sm:text-4xl">{category}</h3>
        <div className="flex items-center gap-4">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex touch-pan-y">
          {slides.map((slide, index) => (
            <a
              key={index}
              href={`/articles/${createSlug(slide.title)}`}
              className="flex min-w-[280px] max-w-[520px] pl-4 sm:min-w-[440px]"
            >
              <div className="flex h-full select-none flex-col items-start rounded-2xl border border-grey-500 bg-background p-4">
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="h-auto w-full rounded-lg object-cover"
                />
                <div>
                  <h4 className="mt-2 font-optima text-xl">{slide.title}</h4>
                  <p className="line-clamp-2 text-sm font-light">
                    {slide.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
