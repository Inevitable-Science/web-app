/*import { ConnectKitButton } from "@/components/ConnectKitButton";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatEthAddress } from "@/lib/utils";
import { ChainBadge } from "../ChainBadge";

export function Nav() {
  return (
    <nav className="w-full fixed background-color mb-16 z-10">
      <div className="ctWrapper flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            <Image
              src="/assets/img/branding/logo.svg"
              width={240}
              height={60}
              alt="Revnet logo"
            />
          </Link>
        </div>

        <div className="
          flex items-center gap-12
          uppercase font-light text-muted-foreground text-sm select-none"
        >
          <Link className="hover:underline" href="/app">Auctions</Link>
          <Link className="hover:underline" href="/app">Articles</Link>
          <Link className="hover:underline" href="/app">Vision</Link>
          <Link className="hover:underline" href="/app">Contributors</Link>
          {/*<ConnectKitButton />* /}
          <ConnectKitButton.Custom>
            {({ isConnected, show, address, ensName }) => {
              return (
                <Button onClick={show} variant="accent" className="px-6">
                  {isConnected ? (ensName ?? (address ? formatEthAddress(address) : "")) : "Login"}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </nav>
  );
}*/


'use client';

import { ConnectKitButton } from "@/components/ConnectKitButton";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatEthAddress } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';

export const Nav: React.FC = () => {
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

      //if (pathname === '/') {
        setIsPastViewport(currentScrollY >= triggerPoint);
      //}

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close mobile menu when scrolling down
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  //}, [lastScrollY, pathname]);
  }, [lastScrollY]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Manage body scrolling and viewport width changes
  useEffect(() => {
    const handleResize = () => {
      // Check if viewport width is >= md breakpoint (768px)
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false); // Close mobile menu on desktop view
      }
    };

    // Set overflow based on isMenuOpen
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Add resize listener to handle viewport width changes
    window.addEventListener('resize', handleResize);
    handleResize(); // Run on mount to check initial width

    return () => {
      document.body.style.overflow = ''; // Cleanup
      window.removeEventListener('resize', handleResize);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <nav
        className={`
          fixed top-0 w-full px-8 pt-6 pb-4 z-50 transition-all duration-300 flex items-center justify-between gap-6
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
          ${isVisible && isPastViewport ? 'bg-background bg-opacity-60' : 'bg-transparent'}
        `}
        // ${pathname === '/' && isVisible && isPastViewport ? 'bg-background bg-opacity-60' : pathname === '/' ? 'bg-transparent' : 'bg-background'}
      >
        <div className="flex items-center gap-6">
          <Link aria-label="Home" href="/">
            <Image
              src="/assets/img/branding/icon.svg"
              width={26}
              height={26}
              className="iconNavSvg select-none pointer-events-none [html.light_&]:brightness-0"
              alt="Icon Image"
            />
            <Image
              src="/assets/img/branding/logo.svg"
              width={240}
              height={68}
              className="logoNavSvg select-none pointer-events-none [html.light_&]:brightness-0"
              alt="Logo Image"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="items-center gap-12 uppercase font-extralight select-none hidden md:flex">
          <Link className="hover:underline" href="/app">
            Auctions
          </Link>
          <Link className="hover:underline" href="/app">
            Articles
          </Link>
          <Link className="hover:underline" href="/app">
            Vision
          </Link>
          <Link className="hover:underline" href="/app">
            Contributors
          </Link>
          {/*<Button variant={"accent"} className="uppercase rounded-full">Log In</Button>*/}
          <ConnectKitButton.Custom>
            {({ isConnected, show, address, ensName }) => {
              return (
                <Button onClick={show} variant="accent" className="px-4 text-center normal-case min-w-[90px]">
                  {isConnected ? (ensName ?? (address ? formatEthAddress(address) : "")) : "LOGIN"}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>

        {/* Hamburger/Close Button */}
        <button
          className="md:hidden z-50 cursor-pointer text-primary"
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
        className={`
          ctWrapper
          fixed inset-0 bg-background bg-opacity-90 z-40 flex flex-col pt-[110px] transition-transform duration-500 ease-in-out
          ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}
          md:hidden
        `}
      >
        <div className="flex flex-col gap-2 uppercase font-extralight text-lg">
          <Link
            className="hover:underline w-fit py-2"
            href="/app"
            onClick={toggleMenu}
          >
            Auctions
          </Link>
          <Link
            className="hover:underline w-fit py-2"
            href="/app"
            onClick={toggleMenu}
          >
            Articles
          </Link>
          <Link
            className="hover:underline w-fit py-2"
            href="/app"
            onClick={toggleMenu}
          >
            Vision
          </Link>
          <Link
            className="hover:underline w-fit py-2"
            href="/app"
            onClick={toggleMenu}
          >
            Contributors
          </Link>
          <ConnectKitButton.Custom>
            {({ isConnected, show, address, ensName }) => {
              return (
                <Button onClick={show} variant="accent" className="px-4 text-center normal-case min-w-[90px]">
                  {isConnected ? (ensName ?? (address ? formatEthAddress(address) : "")) : "LOGIN"}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </>
  );
};