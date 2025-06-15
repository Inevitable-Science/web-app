'use client';

import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import { PrevButton, NextButton, usePrevNextButtons } from './ArrowButtons';
import PartnersComponent from './PartnersComponent';
import useEmblaCarousel from 'embla-carousel-react';

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
            {slides.map((slide, index) => (
              <div key={index} className="flex min-w-[280px] sm:min-w-[440px] pl-4">
                <div className="flex flex-col items-start justify-between h-full p-4 bg-background border border-grey-500 rounded-2xl select-none">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="object-cover rounded-lg w-full h-auto"
                  />
                  <div>
                    <h4 className="text-xl font-optima mt-2">{slide.title}</h4>
                    <p className="text-sm line-clamp-2">{slide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="absolute z-[-10] w-screen hidden md:flex justify-center items-center overflow-hidden"
        style={{ transform: "translateY(-40%)" }}
      >
        {/* Left cloud - shifted slightly right */}
        <img 
          className="z-[-10] select-none w-screen" 
          src="/assets/img/clouds/cloud_bg_1.png"
          style={{ transform: "translateX(-25%)" }}
        />

        {/* Right cloud - shifted slightly left */}
        <img 
          className="z-[-10] select-none w-screen" 
          src="/assets/img/clouds/cloud_bg_3.png" 
          style={{ transform: "translateX(25%)" }}
        />
      </div>


      <PartnersComponent />
    </section>
  );
};

export default ArticleCarousel;