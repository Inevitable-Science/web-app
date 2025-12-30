"use client";
import { JBChainId } from "juice-sdk-react";
import { NATIVE_TOKEN, USDC_ADDRESSES } from "juice-sdk-core";
import { Address } from "viem";
import { useProjectDataStore } from "../../../ProjectDataContext";
import { useSelectedSucker } from "../SelectedSuckerContext";
import { Token } from "@/lib/token";
import Image from "next/image";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

interface ChainSelectorProps {
  value: Token;
  handleChainChange?: (selected: { chainId: JBChainId }) => void;
  handleTokenChange?: (selected: { address: Address }) => void;
  disabled?: boolean;
  options: Token[];
}

export interface TokenWithChain extends Token {
  chainId: JBChainId;
}

export const ChainSelector = ({
  value,
  handleChainChange,
  handleTokenChange,
  disabled,
  options,
}: ChainSelectorProps) => {
  const suckers = useProjectDataStore((state) => state.suckers);
  const { selectedSucker } = useSelectedSucker();

  return (
    <Select
      onValueChange={(value: Address) => {
        handleTokenChange ? handleTokenChange({ address: value }) : undefined;
      }}
      disabled={disabled}
      defaultValue={String(value.address)}
    >
      <SelectTrigger
        className="text-color bg-grey-450 h-fit w-fit rounded-full border-none px-1.5 pt-1.5 pb-0 text-xs"
        aria-label="Select Chain"
        hideChevron
      >
        {value ? (
          <div className="flex items-center pb-1.5 font-light select-none">
            <div className="mr-1 flex items-end">
              {USDC_ADDRESSES[selectedSucker.peerChainId].toLowerCase() ===
              value.address.toLowerCase() ? (
                <Image
                  src={
                    "https://cdn.inevitable.science/static/img/logo/usdc.svg"
                  }
                  alt={`USDC Logo`}
                  width={24}
                  height={24}
                  style={{
                    minWidth: 24,
                    minHeight: 24,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <ChainLogo chainId={1} height={24} width={24} />
              )}

              <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                <ChainLogo
                  chainId={Number(selectedSucker.peerChainId) as JBChainId}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <p className="mr-1 text-[18px]">{value.symbol}</p>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        ) : (
          <span>Select chain</span>
        )}
      </SelectTrigger>
      <SelectContent align="end">
        <div className="mb-2 flex flex-row flex-nowrap items-center gap-1">
          {suckers?.map((sucker) => {
            return (
              <Button
                key={sucker.peerChainId}
                onClick={() => {
                  handleChainChange
                    ? handleChainChange({
                        chainId: sucker.peerChainId,
                      })
                    : undefined;
                }}
                className={`${selectedSucker.peerChainId === sucker.peerChainId && "bg-grey-500! border-(--grey-100)"} rounded-xl`}
                variant={"outline"}
                size="icon"
              >
                <ChainLogo
                  chainId={sucker.peerChainId}
                  height={24}
                  width={24}
                />
              </Button>
            );
          })}
        </div>

        <div className="border-color mb-2 w-full rounded-full border border-b-[0.5px]" />
        {options.map((token, index) => {
          return (
            <SelectItem
              key={`${token.address}-${index}`}
              value={`${token.address}`}
              className="[&>*:last-child]:flex [&>*:last-child]:w-full"
            >
              {token.address.toLowerCase() === NATIVE_TOKEN.toLowerCase() ? (
                <ChainLogo chainId={1} />
              ) : (
                <Image
                  src={
                    "https://cdn.inevitable.science/static/img/logo/usdc.svg"
                  }
                  alt={`USDC Logo`}
                  width={24}
                  height={24}
                  style={{
                    minWidth: 24,
                    minHeight: 24,
                    flexShrink: 0,
                  }}
                />
              )}
              <span className="ml-2 grow">{token.symbol}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
