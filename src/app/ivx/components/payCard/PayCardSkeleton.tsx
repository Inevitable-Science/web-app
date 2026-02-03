import { TokenAndChainSelector } from "@/components/TokenChainSelector";
import { Button } from "@/components/ui/button";
import { Token } from "@/lib/token";
import Image from "next/image";
import { useJBChainId } from "juice-sdk-react";

export function PayCardSkeleton({ selectedToken }: { selectedToken: Token }) {
  const chainId = useJBChainId();

  return (
    <div className="bg-grey-450 flex flex-col rounded-xl p-[10px]">
      <div className="flex flex-col gap-2">
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">YOU PAY</p>
            <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full rounded-lg opacity-30" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <TokenAndChainSelector
              currentToken={selectedToken}
              tokenOptions={[]}
              selectedSucker={{ peerChainId: chainId!, projectId: 0n }}
              suckers={[]}
              handleChainChange={() => null}
              handleTokenChange={() => null}
              disabled
            />
            <div className="flex items-center justify-end gap-1">
              <p className="text-muted-foreground w-[130px] text-right text-sm font-light text-nowrap">
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
          <div className="bg-grey-450 flex w-fit flex-row flex-nowrap items-center gap-1 rounded-full py-1 pr-3 pl-1.5">
            <Image
              src="https://cdn.inevitable.science/static/img/branding/manifest/android-chrome-192x192.png"
              className="rounded-full"
              height={24}
              width={24}
              alt="Token Icon"
            />
            <p className="text-lg font-light">IVX</p>
          </div>
        </div>
        <Button
          loading={true}
          className="bg-primary hover:bg-primary w-full rounded-full px-5 py-2.5 text-center text-sm font-medium text-black focus:outline-hidden disabled:opacity-50"
        >
          Loading
        </Button>
      </div>
    </div>
  );
}
