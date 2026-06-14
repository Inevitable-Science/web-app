import Link from "next/link";
import type { Metadata } from "next";
import { notFoundMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = notFoundMetadata;

export default function NotFound() {
  return (
    <div className="bg-screen relative bg-[url('https://cdn.inevitable.science/static/img/layout/footer.webp')] mask-[linear-gradient(to_bottom,black_30%,black_90%,transparent_100%)] bg-cover">
      <section className="ctWrapper h-screen pt-12">
        <div className="flex flex-col">
          <div className="flex flex-col uppercase md:flex-row">
            <h1 className="font-optima text-5xl sm:text-6xl">Page</h1>
            <div className="flex inline-block flex-col not-italic md:pt-[3.75rem]">
              <h1 className="font-optima text-5xl sm:text-6xl">Not Found</h1>

              <p className="my-8 max-w-[350px] text-wrap">
                Looks like this page wandered off... Try heading back to the
                homepage to get back on track.
              </p>

              <Button variant={"accent"}>
                <Link href="/" className="flex items-center gap-4">
                  Return To Homepage
                  <ArrowRight height={18} width={18} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute bottom-0 left-[60vw]">
            <img // use img as Image does not preserve image quality
              src="https://cdn.inevitable.science/static/img/hero.webp"
              alt="Hero Image"
              className="notFoundHero hidden w-[230px] sm:block"
            />
          </div>
        </div>
        <style>{`

        @media (max-height:630px) {
          .notFoundHero {
            display: none;
          }
        }

        nav{
          display: none;
        }

        footer{
          display: none !important;
        }
        `}</style>
      </section>
    </div>
  );
}
