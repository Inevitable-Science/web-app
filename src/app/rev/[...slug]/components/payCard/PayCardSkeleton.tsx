import { ChainSelector } from "./ChainSelector";
import { Button } from "@/components/ui/button";
import { Token } from "@/lib/token";
import Image from "next/image";

export function PayCardSkeleton({
  selectedToken,
  tokens,
}: {
  selectedToken: Token;
  tokens: Token[];
}) {
  return (
    <div className="flex flex-col rounded-xl bg-grey-450 p-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button className="h-[35px] rounded-none border-b-[1.5px] bg-transparent font-light hover:bg-transparent border-cerulean text-muted-foreground cursor-not-allowed">
            Buy
          </Button>
        </div>

        <div className={`flex p-1 background-color rounded-full`}>
          <div className="activeSkeleton h-[18px] w-[68px] opacity-30 rounded-full" />
        </div>
      </div>

      <div className="my-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
              <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm font-light text-muted-foreground">YOU PAY</p>
                  <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full opacity-30 rounded-lg" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ChainSelector
                    value={selectedToken}
                    options={tokens}
                    disabled={true}
                  />
                  <div className="flex justify-end items-center gap-1">
                    <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground">
                      Balance:
                    </p>
                    <div className="activeSkeleton h-[17px] w-[32px] opacity-30 rounded-md" />
                  </div>
                </div>
              </div>
                
              <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm font-light text-muted-foreground">
                    YOU RECEIVE
                  </p>
                  <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full opacity-30 rounded-lg" />
                </div>
                <div className="flex w-fit flex-row flex-nowrap items-center gap-1 rounded-full bg-grey-450 p-1.5">
                  <Image
                    src="/assets/img/branding/manifest/android-chrome-192x192.png"
                    className="rounded-full"
                    height={24}
                    width={24}
                    alt="Token Icon"
                  />
                  <div className="activeSkeleton h-[24px] w-[44px] max-w-full opacity-30 rounded-full" />
                </div>
              </div>
            </div>
            
            <input
              type="text"
              className="background-color w-full rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow cursor-not-allowed placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
              placeholder="Add a note... (optional)"
              disabled
            />

            <Button
              loading={true}
              className="w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium hover:bg-primary focus:outline-none disabled:opacity-50"
            >
              Loading
            </Button>
          </div>
        </div>
    </div>
  )
}
