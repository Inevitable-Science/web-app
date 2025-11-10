"use client";
import React, {
  ComponentPropsWithRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { EmblaCarouselType } from "embla-carousel";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

type PropType = ComponentPropsWithRef<"button">;

export function PrevButton(props: PropType) {
  const { children, ...restProps } = props;

  return (
    <button
      className="cursor-pointer opacity-80 transition-opacity duration-150 hover:opacity-100 disabled:opacity-60"
      type="button"
      aria-label="Carousel Left"
      {...restProps}
    >
      <ArrowLeftIcon height="28" width="28" />
      {children}
    </button>
  );
}

export function NextButton(props: PropType) {
  const { children, ...restProps } = props;

  return (
    <button
      className="cursor-pointer transition-opacity duration-150 disabled:opacity-60"
      type="button"
      aria-label="Carousel Right"
      {...restProps}
    >
      <ArrowRightIcon height="28" width="28" className="stroke-primary" />
      {children}
    </button>
  );
}
