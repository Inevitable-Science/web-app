import Image from "next/image"
import Link from "next/link"

const Footer: React.FC = () => {
  return (
    <footer className="w-full h-screen bg-[url('/assets/img/footer.png')] bg-cover bg-center flex flex-col text-white px-12 py-8 font-light [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_100%)]">
      {/* CENTERED SECTION */}
      <div className="flex-grow flex flex-col items-center justify-center gap-16">
        <Image src="/assets/img/branding/icon.svg" alt="Icon Logo" height="70" width="38" />
        
        <div className="uppercase flex flex-wrap sm:flex-row flex-col items-center justify-center gap-8">
          <Link href="/auctions" aria-label="Auctions" className="hover:underline">Auctions</Link>
          <Link href="/articles" aria-label="Articles" className="hover:underline">Articles</Link>
          <Link href="/vision" aria-label="Vision" className="hover:underline">Vision</Link>
          <Link href="/contributors" aria-label="Contributors" className="hover:underline">Contributors</Link>
          <Link href="/login" aria-label="Log In" className="hover:underline">Log In</Link>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="w-full flex md:flex-row md:gap-0 gap-4 text-center md:mb-2 mb-8 flex-col-reverse justify-between items-center text-sm">
        <p>All rights reserved Inevitable 2025</p>
        <div className="flex gap-4 items-center">
          <Image src="/assets/img/logo/socials/x.svg" alt="X Logo" height={16} width={16} />
          <Image src="/assets/img/logo/socials/discord.svg" alt="Discord Logo" height={20} width={20} />
          <p>Terms</p>
          <p>Privacy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;