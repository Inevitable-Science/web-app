"use client";
import Image from "next/image";
import { JBChainId } from "juice-sdk-react";
import { JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import { useProjectContext } from "../../ProjectDataContext";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatNumber } from "@/lib/utils";

export interface SuckersBalance {
    balance: JBProjectToken;
    chainId: JBChainId;
    projectId: bigint;
};

interface ChainSelectorProps {
  suckersBalance: SuckersBalance[] | undefined;
  disabled?: boolean;
}

export const WithdrawSelector = ({
  suckersBalance,
  disabled,
}: ChainSelectorProps) => {
  const { suckers, metadata, token } = useProjectContext();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  function handleChainChange( chainId: JBChainId ) {
    const foundSucker = suckers.find(sucker => sucker.peerChainId === chainId);
    if (!foundSucker) return;
    setSelectedSucker(foundSucker);
  };

  return (
    <Select
      onValueChange={(value: string) => {
        handleChainChange(Number(value) as JBChainId);
      }}
      disabled={disabled}
      defaultValue={String(selectedSucker.peerChainId)}
    >
      <SelectTrigger
        className="text-color h-fit w-fit rounded-full border-none bg-grey-450 px-1.5 pb-0 pt-1.5 text-xs"
        aria-label="Select Chain"
        hideChevron
      >
        {selectedSucker ? (
          <div className="flex select-none items-center pb-1.5 font-light">
            <div className="mr-1 flex items-end">
              <Image
                className="rounded-full min-w-[24px] min-h-[24px]"
                src={
                metadata.data?.logoUri
                  ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                  : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
                }
                alt={`Project Token Logo`}
                width={24}
                height={24}
              />

              <div className="-mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
                <ChainLogo
                  chainId={Number(selectedSucker.peerChainId) as JBChainId}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <p className="mr-1 text-[18px]">{token.data?.symbol}</p>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        ) : (
          <span>Select chain</span>
        )}
      </SelectTrigger>
      <SelectContent align="end">
        <div className="flex flex-col gap-1">
          {suckers.map((sucker) => {

            const formattedBalance = suckersBalance
              ?.find(s => s.chainId === sucker.peerChainId)
              ?.balance?.format?.() ?? null;

            return (
              <SelectItem
                key={sucker.peerChainId}
                value={sucker.peerChainId.toString()}
                className="[&>*:last-child]:flex [&>*:last-child]:w-full"
              >
                <div className="flex items-center justify-between gap-2 pb-[0.5px] min-w-[160px]">
                  <div className="flex items-end">
                    <Image
                      className="rounded-full min-w-[24px] min-h-[24px]"
                      src={
                      metadata.data?.logoUri
                        ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                        : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
                      }
                      alt={`Project Token Logo`}
                      width={24}
                      height={24}
                      style={{
                        minWidth: 24,
                        minHeight: 24,
                        flexShrink: 0,
                      }}
                    />

                    <div className="-mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
                      <ChainLogo
                        chainId={Number(sucker.peerChainId) as JBChainId}
                        height={16}
                        width={16}
                      />
                    </div>
                  </div>
                  <span className="grow">
                    {JB_CHAINS[sucker.peerChainId].name}
                  </span>

                  <span className="text-xs text-muted-foreground">{formatNumber(Number(formattedBalance))}</span>
                </div>
              </SelectItem>
            );
          })}
        </div>
      </SelectContent>
    </Select>
  );
};
