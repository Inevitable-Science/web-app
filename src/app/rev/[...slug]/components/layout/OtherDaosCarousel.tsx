"use client";

import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "@/components/home/ArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

type SlideType = {
  img: string;
  href: string;
  title: string;
  description: string;
};

type PropType = {
  slides?: SlideType[];
  options?: EmblaOptionsType;
};

const DEFAULT_SLIDES: SlideType[] = [
  {
    img: "https://cdn.inevitable.science/static/img/daos/cryo.webp",
    href: "cryodao",
    title: "CryoDAO",
    description:
      "DAO specialized in advancing high-impact cryopreservation research.",
  },
  {
    img: "https://cdn.inevitable.science/static/img/daos/hydra.webp",
    href: "hydradao",
    title: "HydraDAO",
    description:
      "Funding and incubating replacement research to extend human lifespan.",
  },
  {
    img: "https://cdn.inevitable.science/static/img/daos/erectus.webp",
    href: "erectusdao",
    title: "Erectus",
    description:
      "Community owned collective funding and promoting male sexual health research.",
  },
  {
    img: "https://cdn.inevitable.science/static/img/daos/cryorat.webp",
    href: "cryorat",
    title: "CryoRat",
    description: "High sub-zero preservation and revival of a rat.",
  },
];

const DEFAULT_OPTIONS: EmblaOptionsType = { align: "start" };

export function OtherDaosCarousel({
  slides = DEFAULT_SLIDES,
  options = DEFAULT_OPTIONS,
}: PropType) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className="mx-auto w-full">
      <div
        className="absolute left-0 right-0 z-[-10] flex justify-center overflow-hidden"
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="mx-auto hidden w-full max-w-[1500px] items-center justify-center md:flex">
          {/* Left cloud - shifted slightly right */}
          <img
            className="z-[-10] w-full select-none"
            src="https://cdn.inevitable.science/static/img/clouds/dao_cloud_bottom_left.webp"
            style={{ transform: "translateX(-40%)" }}
            alt=""
          />

          {/* Right cloud - shifted slightly left */}
          <img
            className="z-[-10] w-full select-none"
            src="https://cdn.inevitable.science/static/img/clouds/dao_cloud_bottom_right.webp"
            style={{ transform: "translateX(25%)" }}
            alt=""
          />
        </div>
      </div>

      <div className="ctWrapper">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-extralight sm:text-4xl">
            More Inevitable DAOs
          </h3>
          <div className="flex items-center gap-4">
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex touch-pan-y">
            {slides.map((slide, index) => (
              <Link
                key={index}
                href={`/project/${slide.href}`}
                className="flex min-w-[280px] pl-4 sm:min-w-[440px]"
              >
                <div
                  className="flex h-full min-h-[370px] select-none flex-col items-start justify-between rounded-2xl bg-background bg-cover bg-center p-4"
                  style={{ backgroundImage: `url(${slide.img})` }}
                >
                  <div />
                  <div className="w-full rounded-lg p-2">
                    <h4 className="mt-2 font-optima text-xl">{slide.title}</h4>
                    <p className="line-clamp-2 text-sm">{slide.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
