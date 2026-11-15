"use client";
import { useEffect, useRef } from "react";

const VIDEO_FULL = "https://cdn.inevitable.science/static/img/layout/home_hero_main.mp4";
const VIDEO_SMALL = "https://cdn.inevitable.science/static/img/layout/home_hero_main_small.mp4";

interface NetworkParams {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
}

function shouldUseSmallVideo(): boolean {
  if (window.matchMedia("(max-width: 640px)").matches) return true;

  const connection = (navigator as Navigator & { connection?: NetworkParams }).connection;
  
  // returns false if unavailable - non-chromium
  if (!connection) return false;

  const SLOW_CONNECTION_TYPES = ["slow-2g", "2g", "3g"];
  const SLOW_DOWNLINK_MBPS = 5;

  return (
    connection.saveData === true ||
    SLOW_CONNECTION_TYPES.includes(connection.effectiveType ?? "") ||
    (connection.downlink !== undefined && connection.downlink < SLOW_DOWNLINK_MBPS)
  );
}

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = shouldUseSmallVideo() ? VIDEO_SMALL : VIDEO_FULL;

    let inView = true;

    const update = () => {
      if (inView && !document.hidden) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      poster="https://cdn.inevitable.science/static/img/layout/vid_first_frame.webp"
      className="absolute inset-0 h-full w-full object-cover object-[calc(50%+80px)_center] sm:object-center"
      preload="auto"
      loop
      muted
      playsInline
    >
      Your browser does not support the video tag.
    </video>
  );
}
