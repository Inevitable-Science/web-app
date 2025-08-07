"use client";

import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import { PrevButton, NextButton, usePrevNextButtons } from "@/components/home/ArrowButtons";
import useEmblaCarousel from "embla-carousel-react";

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
    img: "/assets/img/daos/cryo.webp",
    title: "CryoDAO",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    img: "/assets/img/daos/moon.webp",
    title: "MoonDAO",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    img: "/assets/img/daos/erectus.webp",
    title: "Erectus",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    img: "/assets/img/daos/placeholder_1.webp",
    title: "DAO Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
];

const DEFAULT_OPTIONS: EmblaOptionsType = { align: "start" };

const OtherDaosCarousel: React.FC<PropType> = ({ slides = DEFAULT_SLIDES, options = DEFAULT_OPTIONS }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className="w-full mx-auto">
      <div className="absolute z-[-10] left-0 right-0 flex justify-center overflow-hidden" style={{ transform: "translateY(-50%)" }}>
        <div className="w-full max-w-[1500px] hidden md:flex justify-center items-center mx-auto">
          {/* Left cloud - shifted slightly right */}
          <img
            className="z-[-10] select-none w-full"
            src="/assets/img/clouds/dao_cloud_bottom_left.webp"
            style={{ transform: "translateX(-40%)" }}
            alt=""
          />

          {/* Right cloud - shifted slightly left */}
          <img
            className="z-[-10] select-none w-full"
            src="/assets/img/clouds/dao_cloud_bottom_right.webp"
            style={{ transform: "translateX(25%)" }}
            alt=""
          />
        </div>
      </div>

      <div className="ctWrapper">
        <div className="flex justify-between items-center mb-4">
          <h3 className="sm:text-4xl text-2xl font-extralight">More Inevitable DAOs</h3>
          <div className="flex gap-4 items-center">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {slides.map((slide, index) => (
              <div key={index} className="flex min-w-[280px] sm:min-w-[440px] pl-4">
                <div
                  className="flex flex-col items-start justify-between h-full min-h-[370px] p-4 bg-background rounded-2xl select-none bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.img})` }}
                >
                  <div />
                  <div className="rounded-lg p-2 w-full">
                    <h4 className="text-xl font-optima mt-2">{slide.title}</h4>
                    <p className="text-sm line-clamp-2">{slide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OtherDaosCarousel;