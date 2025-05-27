import Image from "next/image"
import Link from "next/link"

const HomeNavbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full px-12 py-8 flex items-center justify-between z-10">
      <div className="flex items-center gap-6">
        <Link aria-label="Home" href="/">
          <Image src="/assets/img/branding/logo.svg" width={290} height={68} className="select-none pointer-events-none [html.light_&]:brightness-0" alt="Logo Image" />
        </Link>
      </div>

      <div className="
        flex items-center gap-12
        uppercase font-extralight select-none"
      >
        <Link className="hover:underline" href="/app">Home</Link>
        <Link className="hover:underline" href="/app">Features</Link>
        <Link className="hover:underline" href="/app">About</Link>
        <Link className="hover:underline" href="/app">FAQ</Link>
        <Link className="hover:underline" href="/app">Contact</Link>
      </div>
    </nav>
  );
};

export default HomeNavbar;