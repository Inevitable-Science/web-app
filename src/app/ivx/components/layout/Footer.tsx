import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <div className="relative z-[-1] -mt-[240px] flex h-[600px] w-full items-end bg-[url('/assets/img/layout/ivx/ivx_footer_image.webp')] bg-cover bg-center px-12 pb-[144px] pt-8 font-light [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_100%)]">
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
    </div>
  );
}
