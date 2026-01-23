import { ChainSelector } from "./payTab/ChainSelector";
import { Button } from "@/components/ui/button";
import { Token } from "@/lib/token";
import Image from "next/image";

export function PayCardSkeleton({ selectedToken }: { selectedToken: Token }) {
  return (
    <div className="bg-grey-450 flex flex-col rounded-xl p-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button className="border-cerulean text-muted-foreground h-[35px] cursor-not-allowed rounded-none border-b-[1.5px] bg-transparent font-light hover:bg-transparent">
            Buy
          </Button>
        </div>

        <div className={`background-color flex rounded-full p-1`}>
          <div className="activeSkeleton h-[18px] w-[68px] rounded-full opacity-30" />
        </div>
      </div>

      <div className="my-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
              <div className="flex flex-col gap-[2px]">
                <p className="text-muted-foreground text-sm font-light">
                  YOU PAY
                </p>
                <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full rounded-lg opacity-30" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <ChainSelector
                  value={selectedToken}
                  options={[selectedToken]}
                  disabled
                />
                <div className="flex items-center justify-end gap-1">
                  <p className="text-muted-foreground text-right text-sm font-light text-nowrap">
                    Balance:
                  </p>
                  <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
                </div>
              </div>
            </div>

            <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
              <div className="flex flex-col gap-[2px]">
                <p className="text-muted-foreground text-sm font-light">
                  YOU RECEIVE
                </p>
                <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full rounded-lg opacity-30" />
              </div>
              <div className="bg-grey-450 flex w-fit flex-row flex-nowrap items-center gap-1 rounded-full p-1.5">
                <Image
                  src="https://cdn.inevitable.science/static/img/branding/manifest/android-chrome-192x192.png"
                  className="rounded-full"
                  height={24}
                  width={24}
                  alt="Token Icon"
                />
                <div className="activeSkeleton h-[24px] w-[44px] max-w-full rounded-full opacity-30" />
              </div>
            </div>
          </div>

          <input
            type="text"
            className="background-color placeholder:text-muted-foreground focus:ring-cerulean focus:ring-offset-grey-450 w-full cursor-not-allowed rounded-lg border-none p-2 text-sm font-light outline-hidden transition-shadow focus:ring-2 focus:ring-offset-2"
            placeholder="Add a note... (optional)"
            disabled
          />

          <Button
            loading={true}
            className="bg-cerulean hover:bg-primary w-full rounded-full px-5 py-2.5 text-center text-sm font-medium focus:outline-hidden disabled:opacity-50"
          >
            Loading
          </Button>
        </div>
      </div>
    </div>
  );
}
