'use client';

import React from 'react';
import Image from 'next/image';

type SlideType = {
  img: string;
  name: string;
  description: string;
  linkedIn?: string;
  twitter?: string;
};

const slides: SlideType[] = [
  {
    img: '/assets/img/team/kai_member.webp',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    twitter: 'https://x.com/kaimicahmills',
    linkedIn: 'https://www.linkedin.com/in/kaimicahmills',
  },
  {
    img: '/assets/img/team/kai_member.webp',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    img: '/assets/img/team/kai_member.webp',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    twitter: 'https://x.com/kaimicahmills',
  },
  {
    img: '/assets/img/team/kai_member.webp',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    linkedIn: 'https://www.linkedin.com/in/kaimicahmills',
  },
  {
    img: '/assets/img/team/kai_member.webp',
    name: 'Kai Micah Mills',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    twitter: 'https://x.com/kaimicahmills',
    linkedIn: 'https://www.linkedin.com/in/kaimicahmills',
  },
];

const TeamComponent: React.FC = () => {
  return (
    <section>
      <div className="flex flex-wrap gap-4 justify-center mt-48">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="flex min-w-[180px] max-w-[360px] sm:max-w-[250px] w-full"
          >
            <div className="flex flex-col items-start h-full p-3 bg-background border border-grey-500 rounded-2xl text-center select-none w-full">
              <img
                src={slide.img}
                alt={slide.name}
                className="object-cover rounded-lg w-full h-auto"
              />
              <div>
                <h4 className="text-xl font-optima mt-2">{slide.name}</h4>
                <p className="text-sm text-muted-foreground font-light line-clamp-2">
                  {slide.description}
                </p>
                <div className="flex justify-center items-center gap-2 mt-4">
                  {slide.linkedIn && (
                    <a href={slide.linkedIn} target="_blank" rel="noopener noreferrer">
                      <Image
                        src="/assets/img/team/linked_in_image.webp"
                        alt="Linked In Logo"
                        height={45}
                        width={28}
                      />
                    </a>
                  )}
                  {slide.twitter && (
                    <a href={slide.twitter} target="_blank" rel="noopener noreferrer">
                      <Image
                        src="/assets/img/team/twitter_image.webp"
                        alt="Twitter Logo"
                        height={41}
                        width={28}
                      />
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

export default TeamComponent;