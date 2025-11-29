import Image from "next/image";
import Link from "next/link";
import { FooterLoginButton } from "./FooterLoginButton";

export default function Footer() {
  return (
    <footer className="flex h-screen w-full flex-col bg-[url('/assets/img/layout/footer.webp')] bg-cover bg-center px-12 py-8 font-light mask-[linear-gradient(to_bottom,transparent_0%,black_10%,black_100%)]">
      {/* CENTERED SECTION */}
      <div className="flex grow flex-col items-center justify-center gap-16">
        <Image
          src="https://cdn.inevitable.science/static/img/branding/icon.svg"
          alt="Icon Logo"
          height="70"
          width="38"
        />

        <div className="flex flex-col flex-wrap items-center justify-center gap-8 uppercase sm:flex-row">
          <Link href="/" aria-label="Auctions" className="hover:underline">
            Projects
          </Link>
          <Link href="/vision" aria-label="Vision" className="hover:underline">
            Vision
          </Link>
          <Link href="/team" aria-label="Team" className="hover:underline">
            Team
          </Link>
          <Link
            href="/articles"
            aria-label="Articles"
            className="hover:underline"
          >
            Articles
          </Link>
          <FooterLoginButton />
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="mb-8 flex w-full flex-col-reverse items-center justify-between gap-4 text-center text-sm md:mb-2 md:flex-row md:gap-0">
        <p>All rights reserved Inevitable 2025</p>
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/inevitablesci"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.inevitable.science/static/img/logo/socials/x.svg"
              alt="X Logo"
              height={16}
              width={16}
            />
          </a>

          <a
            href="https://discord.gg/inevitable"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.inevitable.science/static/img/logo/socials/discord.svg"
              alt="Discord Logo"
              height={20}
              width={20}
            />
          </a>

          <Link
            href="/legal/terms"
            aria-label="Terms and Conditions"
            className="hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/legal/privacy"
            aria-label="Privacy Policy"
            className="hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
