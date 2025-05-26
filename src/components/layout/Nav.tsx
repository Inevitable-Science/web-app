/*import { ConnectKitButton } from "@/components/ConnectKitButton";
import Image from "next/image";
import Link from "next/link";
import { ChainBadge } from "../ChainBadge";

export function Nav() {
  return (
    <nav className="text-zinc-50 border-b border-zinc-100">
      <div className="flex justify-between items-center px-4 sm:container py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="italic">
            <Image
              src="/assets/img/small-bw.svg"
              width={60}
              height={60}
              alt="Revnet logo"
            />
          </Link>
        </div>
        <ConnectKitButton />
      </div>
    </nav>
  );
}
*/

import { ConnectKitButton } from "@/components/ConnectKitButton";
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
          {/*<ConnectKitButton />*/}
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
}