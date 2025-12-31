"use client";

import { EmblaOptionsType } from "embla-carousel";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "@/components/home/ArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

export interface SlideType {
  landingImage: string;
  title: string;
  overview: string;
  articleId: string;
}

interface Props {
  category?: string;
  slides?: SlideType[];
  options?: EmblaOptionsType;
}

const DEFAULT_OPTIONS: EmblaOptionsType = { align: "start" };

export function DynamicArticleCarousel({
  category = "Category",
  slides = [],
  options = DEFAULT_OPTIONS,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  if (slides.length === 0) return null;

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
          {slides.map((slide) => (
            <a
              key={slide.articleId}
              href={`/articles/${slide.articleId}`}
              className="flex max-w-[520px] min-w-[280px] pl-4 sm:min-w-[440px]"
            >
              <div className="border-grey-500 bg-background flex h-full flex-col items-start rounded-2xl border p-4 select-none">
                <Image
                  src={slide.landingImage || "/placeholder.png"}
                  alt={slide.title}
                  height={270}
                  width={470}
                  className="h-auto w-full rounded-lg object-cover"
                />
                <div className="mt-4">
                  <h4 className="font-optima text-xl line-clamp-1">{slide.title}</h4>
                  <p className="text-muted-foreground line-clamp-2 text-sm font-light">
                    {slide.overview}
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
