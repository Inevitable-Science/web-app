"use client";

import { ConnectKitButton } from "connectkit";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEthAddress } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";

export function Nav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isPastViewport, setIsPastViewport] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const triggerPoint = window.innerHeight;
      setIsPastViewport(currentScrollY >= triggerPoint);

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close mobile menu when scrolling down
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Manage body scrolling and viewport width changes
  useEffect(() => {
    const handleResize = () => {
      // Check if viewport width is >= md breakpoint (825px)
      if (window.innerWidth >= 825) {
        setIsMenuOpen(false); // Close mobile menu on desktop view
      }
    };

    // Set overflow based on isMenuOpen
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Add resize listener to handle viewport width changes
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-50 flex w-full items-center justify-between gap-6 px-8 pt-6 pb-4 transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"} ${isVisible && isPastViewport ? "bg-background bg-opacity-60" : "bg-transparent"} `}
      >
        <div className="flex items-center gap-6">
          <Link aria-label="Home" href="/">
            <Image
              src="https://cdn.inevitable.science/static/img/branding/icon.svg"
              width={26}
              height={26}
              className="iconNavSvg pointer-events-none select-none [html.light_&]:brightness-0"
              alt="Icon Image"
            />
            <Image
              src="https://cdn.inevitable.science/static/img/branding/logo.svg"
              width={240}
              height={46}
              className="logoNavSvg pointer-events-none select-none [html.light_&]:brightness-0"
              alt="Logo Image"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="navMinMD items-center gap-12 font-extralight uppercase select-none">
          <Link
            className={`${pathname === "/" && "text-light-gold"} hover:underline`}
            href="/"
            aria-label="Projects"
          >
            Projects
          </Link>
          <Link
            className={`${pathname === "/ecosystem" && "text-light-gold"} hover:underline`}
            href="/ecosystem"
            aria-label="Ecosystem"
          >
            Ecosystem
          </Link>
          <Link
            className={`${pathname === "/vision" && "text-light-gold"} hover:underline`}
            href="/vision"
            aria-label="Vision"
          >
            Vision
          </Link>
          <Link
            className={`${pathname === "/team" && "text-light-gold"} hover:underline`}
            href="/team"
            aria-label="Team"
          >
            Team
          </Link>
          <Link
            className={`${pathname.startsWith("/articles") && "text-light-gold"} hover:underline`}
            href="/articles"
            aria-label="Articles"
          >
            Articles
          </Link>

          <ConnectKitButton.Custom>
            {({ isConnected, show, address, ensName }) => {
              return (
                <Button
                  onClick={show}
                  variant="accent"
                  className="block w-fit max-w-[140px] min-w-[90px] truncate overflow-hidden px-3 text-center text-ellipsis normal-case"
                >
                  {isConnected
                    ? (ensName ?? (address ? formatEthAddress(address) : ""))
                    : "LOGIN"}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>

        {/* Hamburger/Close Button */}
        <button
          className="navMaxMD text-primary z-50 cursor-pointer"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`ctWrapper bg-background bg-opacity-90 fixed inset-0 z-40 flex flex-col pt-[110px] transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-y-0" : "hidden translate-y-full"} navMaxMD`}
      >
        <div className="flex flex-col gap-2 text-lg font-extralight uppercase">
          <Link
            className={`${pathname === "/" && "text-light-gold"} w-fit py-2 hover:underline`}
            href="/"
            aria-label="Projects"
            onClick={toggleMenu}
          >
            Projects
          </Link>
          <Link
            className={`${pathname === "/ecosystem" && "text-light-gold"} w-fit py-2 hover:underline`}
            href="/ecosystem"
            aria-label="Ecosystem"
          >
            Ecosystem
          </Link>
          <Link
            className={`${pathname === "/vision" && "text-light-gold"} w-fit py-2 hover:underline`}
            href="/vision"
            aria-label="Vision"
            onClick={toggleMenu}
          >
            Vision
          </Link>
          <Link
            className={`${pathname === "/team" && "text-light-gold"} w-fit py-2 hover:underline`}
            href="/team"
            aria-label="Team"
            onClick={toggleMenu}
          >
            Team
          </Link>
          <Link
            className={`${pathname === "/articles" && "text-light-gold"} w-fit py-2 hover:underline`}
            href="/articles"
            aria-label="Articles"
            onClick={toggleMenu}
          >
            Articles
          </Link>
          <ConnectKitButton.Custom>
            {({ isConnected, show, address, ensName }) => {
              return (
                <Button
                  onClick={show}
                  variant="accent"
                  className="block w-fit min-w-[90px] truncate overflow-hidden px-4 text-center text-ellipsis normal-case"
                >
                  {isConnected
                    ? (ensName ?? (address ? formatEthAddress(address) : ""))
                    : "LOGIN"}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>

      <style>{`

      @media(min-width:825px){
        .navMinMD{
          display: flex;
        }

        .navMaxMD{
          display: none;
        }
      }

      @media(max-width:825px){
        .navMaxMD{
          display: block;
        }

        .navMinMD{
          display: none;
        }
      }

      `}</style>
    </>
  );
}
