'use client';

import React from 'react';
import Image from 'next/image';
import { EmblaOptionsType } from 'embla-carousel';
import { PrevButton, NextButton, usePrevNextButtons } from "@/components/home/ArrowButtons";
import useEmblaCarousel from 'embla-carousel-react';

type SlideType = {
  img: string;
  name: string;
  description: string;
  linkedIn?: string;
  twitter?: string;
};

type PropType = {
  category?: string;
  slides?: SlideType[];
  options?: EmblaOptionsType;
};

const slides: SlideType[] = [
  {
    img: '/assets/img/team/kai_member.png',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    twitter: 'https://x.com/kaimicahmills',
    linkedIn: 'https://www.linkedin.com/in/kaimicahmills',
  },
  {
    img: '/assets/img/team/kai_member.png',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    img: '/assets/img/team/kai_member.png',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    twitter: 'https://x.com/kaimicahmills',
  },
  {
    img: '/assets/img/team/kai_member.png',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    linkedIn: 'https://www.linkedin.com/in/kaimicahmills',
  },
  {
    img: '/assets/img/team/kai_member.png',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    twitter: 'https://x.com/kaimicahmills',
    linkedIn: 'https://www.linkedin.com/in/kaimicahmills',
  },
];

const options: EmblaOptionsType = { align: 'start' };

const TeamCarousel: React.FC<PropType> = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section>
      <div>
        <div className="hidden sm:flex justify-between items-center mb-4">
          <h3 className="sm:text-4xl text-2xl font-extralight">
            Team members
          </h3>
          <div className="flex gap-4 items-center">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>
        </div>
        <div className="hidden sm:block overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {slides.map((slide, index) => (
              <div key={index} className="flex min-w-[280px] sm:min-w-[344px] max-w-[360px] pl-4">
                <div className="flex flex-col items-start h-full p-3 bg-background border border-grey-500 rounded-2xl text-center select-none">
                  <img
                    src={slide.img}
                    alt={slide.name}
                    className="object-cover rounded-lg w-full h-auto"
                  />
                  <div>
                    <h4 className="text-xl font-optima mt-2">{slide.name}</h4>
                    <p className="text-sm text-muted-foreground font-light line-clamp-2">{slide.description}</p>
                    <div className="flex justify-center items-center gap-2 mt-4">
                      {slide.linkedIn && (
                        <a 
                          href={slide.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Image src="/assets/img/team/linked_in_image.png" alt="Linked In Logo" height={45} width={28} />
                        </a>
                      )}

                      {slide.twitter && (
                        <a 
                          href={slide.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Image src="/assets/img/team/twitter_image.png" alt="Twitter Logo" height={41} width={28} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sm:hidden flex flex-col gap-4 justify-center items-center w-full">
        {slides.map((slide, index) => (
          <div key={index} className="flex min-w-[200px] max-w-[390px] w-full pl-4">
            <div className="flex flex-col items-start h-full p-3 bg-background border border-grey-500 rounded-2xl text-center select-none">
              <img
                src={slide.img}
                alt={slide.name}
                className="object-cover rounded-lg w-full h-auto"
              />
              <div>
                <h4 className="text-xl font-optima mt-2">{slide.name}</h4>
                <p className="text-sm text-muted-foreground font-light line-clamp-2">{slide.description}</p>
                <div className="flex justify-center items-center gap-2 mt-4">
                  {slide.linkedIn && (
                    <a 
                      href={slide.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Image src="/assets/img/team/linked_in_image.png" alt="Linked In Logo" height={45} width={28} />
                    </a>
                  )}

                  {slide.twitter && (
                    <a 
                      href={slide.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Image src="/assets/img/team/twitter_image.png" alt="Twitter Logo" height={41} width={28} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamCarousel;