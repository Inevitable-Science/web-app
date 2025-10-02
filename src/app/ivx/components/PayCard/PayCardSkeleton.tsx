import { JBChainId } from "juice-sdk-core";
import { ChainSelector } from "./ChainSelect";
import { useSelectedSucker } from "../../SelectedSuckerContext";
import { useIVXContext } from "../../DataProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function PayCardSkeleton() {
  const { suckers } = useIVXContext();
  const { selectedSucker } = useSelectedSucker();

  const emptyReturnFunction = () => {
    return;
  };

  return (
    <div className="flex flex-col rounded-xl bg-grey-450 p-[10px]">
      <div className="flex flex-col gap-2">
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground">YOU PAY</p>
            <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full rounded-lg" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <ChainSelector
              value={selectedSucker?.peerChainId || (1 as JBChainId)}
              options={suckers?.map((s) => s.peerChainId) ?? []}
              onChange={emptyReturnFunction}
              disabled={true}
            />
            <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground">
              Balance: --
            </p>
          </div>
        </div>
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground">
              YOU RECEIVE
            </p>
            <div className="activeSkeleton mt-1 h-[30px] w-[130px] max-w-full rounded-lg" />
          </div>
          <div className="flex w-fit flex-row flex-nowrap items-center gap-1 rounded-full bg-grey-450 py-1 pl-1.5 pr-3">
            <Image
              src="/assets/img/branding/manifest/android-chrome-192x192.png"
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
          className="w-full rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-primary focus:outline-none disabled:opacity-50"
        >
          Loading
        </Button>
      </div>
    </div>
  );
}
