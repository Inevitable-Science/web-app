"use client";
import { Button } from "../ui/button";

export default function ExploreButton() {
  const handleScroll = () => {
    const element = document.getElementById("projects-target");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      onClick={handleScroll}
      variant={"accent"}
      className="mt-2 w-full rounded-full px-6 font-medium uppercase sm:w-fit"
    >
      Explore Inevitable
    </Button>
  );
}
