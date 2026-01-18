import Image from "next/image";
import Link from "next/link";
import { formatUnits } from "viem";
import { formatNumber } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { fetchSuckerGroupVol } from "@/lib/helpers/getSuckerGroupVol";

export const revalidate = 900;

export default async function AuctionComponent() {

  const suckerGroupId = "a93b9ffae5b616880a64953c0515081a"; // mainnet - Stasis Suckers Group ID
  const chainId = 1;
  const suckerGroupVol = await fetchSuckerGroupVol(suckerGroupId, chainId);

  return (
    <section className="bg-[url('https://cdn.inevitable.science/static/img/auction_bg.webp')] bg-cover bg-center px-4 py-10 md:rounded-2xl md:py-4">
      <div className="bg-background flex w-full flex-col justify-between gap-[112px] rounded-2xl p-[16px] sm:min-h-[650px] sm:p-[32px] md:w-[40%] md:min-w-[490px]">
        <div className="flex flex-col gap-2">
          <Image
            className="mb-3 block rounded-2xl md:hidden"
            src="https://cdn.inevitable.science/static/img/auction_bg.webp"
            height={390}
            width={690}
            alt="Auction Image"
          />
          <h3 className="font-optima text-3xl uppercase">Stasis</h3>
          <p className="text-sm">
            CryoDAO, HydraDAO, Tomorrow Bio, and Cryopets are partnering to
            develop the first purpose-built long-term cryopreservation facility
            and research lab in the United States. This facility builds on the
            success of the world’s first such site, the European Biostasis
            Foundation, opened in Switzerland in 2022. With a projected size of
            8,000–9,000 sqft on a 2-acre plot, the facility will be designed for
            the safe, secure storage of 1,000–2,000 patients, with expansion
            capabilities.
          </p>
          <Link
            href="/rev/@stasis"
            aria-label="View Auction"
            className="mt-2 w-fit text-base font-medium uppercase hover:underline"
          >
            <div className="flex items-center gap-3 font-normal transition-[gap] duration-150 hover:gap-5">
              Go To Auction
              <ArrowRight height={20} width={20} />
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#1F1F1F] p-[12px]">
          <div className="ml-2 flex flex-col gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-semibold md:text-4xl">27</h3>
                <p className="text-sm font-light md:text-base">DAYS</p>
              </div>
              <h3 className="text-3xl font-bold">:</h3>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-semibold md:text-4xl">08</h3>
                <p className="text-sm font-light md:text-base">HRS</p>
              </div>
              <h3 className="text-3xl font-bold">:</h3>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-semibold md:text-4xl">32</h3>
                <p className="text-sm font-light md:text-base">MINS</p>
              </div>
            </div>
            <p>left till auction closes</p>
          </div>

          <div className="flex h-[110px] w-[110px] items-center justify-center rounded-2xl bg-[#253031] sm:h-[140px] sm:w-[140px]">
            <div className="flex flex-col items-center gap-1 text-center">
              <h4 className="flex items-center gap-2 text-xl font-semibold sm:text-3xl">
                {suckerGroupVol?.decimals === 18 ? "Ξ" : "$"}
                {suckerGroupVol
                  ? Number(
                      formatNumber(
                        Number(formatUnits(suckerGroupVol.volume, suckerGroupVol.decimals)),
                        true
                      )
                    ).toFixed(2)
                  : "—"}
              </h4>
              <h5>RAISED</h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
