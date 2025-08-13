"use client";

import React from "react";
import Image from "next/image";

type SlideType = {
  img: string;
  name: string;
  description: string;
  linkedIn?: string;
  twitter?: string;
};

const slides: SlideType[] = [
  {
    img: "/assets/img/team/kai_member.webp",
    name: "Kai Micah Mills",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    twitter: "https://x.com/kaimicahmills",
    linkedIn: "https://www.linkedin.com/in/kaimicahmills",
  },
  {
    img: "/assets/img/team/eli_member.webp",
    name: "Eli Mohamad",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    twitter: "https://x.com/elimohamad",
    linkedIn: "https://www.linkedin.com/in/emohamad/",
  },
  {
    img: "/assets/img/team/austin_member.webp",
    name: "Austin Lynch",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    twitter: "https://x.com/AustinTLynch",
    linkedIn: "https://www.linkedin.com/in/austin-lynch-61a673202",
  },
  {
    img: "/assets/img/team/emil_member.webp",
    name: "Dr. Emil Kendziorra",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    twitter: "https://x.com/emilkendziorra",
    linkedIn: "https://www.linkedin.com/in/emilkendziorra/",
  },
  {
    img: "/assets/img/team/jango_member.webp",
    name: "Jango",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    twitter: "https://x.com/me_jango",
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
                        className="pointer-events-none select-none"
                        height={45}
                        width={28}
                      />
                    </a>
                  )}
                  {slide.twitter && (
                    <a href={slide.twitter} target="_blank" rel="noopener noreferrer">
                      <Image
                        src="/assets/img/team/twitter_image.webp"
                        className="pointer-events-none select-none"
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