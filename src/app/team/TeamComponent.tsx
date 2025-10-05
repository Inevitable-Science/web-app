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
    description:
      "Founder of CryoDAO, HydraDAO, Cryopets, and the American Biostasis Foundation.",
    twitter: "https://x.com/kaimicahmills",
    linkedIn: "https://www.linkedin.com/in/kaimicahmills",
  },
  {
    img: "/assets/img/team/eli_member.webp",
    name: "Eli Mohamad",
    description:
      "Founder of ErectusDAO, CryoDAO, and HydraDAO. Co-founded X-Therma and the Organ Preservation Alliance.",
    twitter: "https://x.com/elimohamad",
    linkedIn: "https://www.linkedin.com/in/emohamad/",
  },
  {
    img: "/assets/img/team/austin_member.webp",
    name: "Austin Lynch",
    description:
      "Founder of HydraDAO, Steward of CryoDAO, Head of Member Care at Cryopets.",
    twitter: "https://x.com/AustinTLynch",
    linkedIn: "https://www.linkedin.com/in/austin-lynch-61a673202",
  },
  {
    img: "/assets/img/team/emil_member.webp",
    name: "Dr. Emil Kendziorra",
    description:
      "Founder of Tomorrow Bio, the European Biostasis Foundation, CryoDAO, and HydraDAO.",
    twitter: "https://x.com/emilkendziorra",
    linkedIn: "https://www.linkedin.com/in/emilkendziorra/",
  },
  {
    img: "/assets/img/team/jango_member.webp",
    name: "Jango",
    description: "Founder of Juicebox Protocol, Revnets, and Banny Network.",
    twitter: "https://x.com/me_jango",
  },
];

export function TeamComponent(){
  return (
    <section>
      {/*<div className="flex flex-wrap gap-4 justify-center mt-48">*/}
      <div className="mt-48 flex flex-wrap justify-center gap-4 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="flex w-full min-w-[180px] max-w-[360px] sm:max-w-[250px] lg:max-w-[500px]"
          >
            <div className="flex h-full w-full select-none flex-col items-start rounded-2xl border border-grey-500 bg-background p-3 text-center">
              <img
                src={slide.img}
                alt={slide.name}
                className="h-auto w-full rounded-lg object-cover"
              />
              <div>
                <h4 className="mt-2 font-optima text-xl">{slide.name}</h4>
                <p className="text-sm font-light text-muted-foreground">
                  {slide.description}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {slide.linkedIn && (
                    <a
                      href={slide.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
                    <a
                      href={slide.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
