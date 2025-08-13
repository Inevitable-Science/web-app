"use client"
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
      className="rounded-full px-6 mt-2 sm:w-fit w-full font-medium uppercase"
    >
      Explore Inevitable
    </Button>
  );
}
