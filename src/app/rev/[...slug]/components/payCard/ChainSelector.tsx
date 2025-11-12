/*import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { ChainLogo } from "../../../../components/ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { sortChains } from "@/lib/utils";

interface ChainSelectorProps {
  value: JBChainId;
  onChange: (chainId: JBChainId) => void;
  disabled?: boolean;
  options: JBChainId[];
}

export const ChainSelector = ({
  value,
  onChange,
  disabled,
  options,
}: ChainSelectorProps) => {
  const chainOptions = sortChains(options);

  return (
    <Select
      onValueChange={(value) => {
        onChange(Number(value) as JBChainId);
      }}
      disabled={disabled}
      defaultValue={String(value)}
    >
      <SelectTrigger
        className="background-color text-color h-fit w-fit rounded-full border-none p-1.5 text-xs"
        aria-label="Select Chain"
      >
        <SelectValue placeholder="Select chain">
          {value ? (
            <div className="mr-1">
              <ChainLogo
                chainId={Number(value) as JBChainId}
                height={24}
                width={24}
              />
              {/*<span>{JB_CHAINS[value].name}</span>* /}
            </div>
          ) : (
            <span>Select chain</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {chainOptions.map((chainId) => (
          <SelectItem key={chainId} value={chainId.toString()}>
            <div className="flex items-center gap-2 font-light">
              <ChainLogo chainId={chainId as JBChainId} />
              <span>{JB_CHAINS[chainId as JBChainId].name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
*/









"use client";
import { JBChainId } from "juice-sdk-react";
import { NATIVE_TOKEN, USDC_ADDRESSES } from "juice-sdk-core";
import { Address } from "viem";
import { useProjectContext } from "../../ProjectDataContext";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { Token } from "@/lib/token";
import Image from "next/image";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectTrigger,
  SelectValue,
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
  const { suckers } = useProjectContext();
  const { selectedSucker } = useSelectedSucker();

  return (
    <Select
      onValueChange={(value: Address) => {
        handleTokenChange ? handleTokenChange({ address: value }) : undefined;
      }}
      disabled={disabled}
      defaultValue={String(value)}
    >
      <SelectTrigger
        className="text-color h-fit w-fit rounded-full border-none bg-grey-450 px-1.5 pb-0 pt-1.5 text-xs"
        aria-label="Select Chain"
        hideChevron
      >
        <SelectValue placeholder="Select chain">
          {value ? (
            <div className="flex items-center pb-1.5 font-light select-none">
              <div className="flex items-end mr-1">
                {USDC_ADDRESSES[selectedSucker.peerChainId].toLowerCase() ===
                value.address.toLowerCase() ? (
                  <Image
                    src={"/assets/img/logo/usdc.svg"}
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

                <div className="-mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
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
        </SelectValue>
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
                        chainId: sucker.peerChainId as JBChainId,
                      })
                    : undefined;
                }}
                className={`${selectedSucker.peerChainId === sucker.peerChainId && "border-[var(--grey-100)] !bg-grey-500"} rounded-xl`}
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
              value={`${token.address}` as Address}
              className="[&>*:last-child]:flex [&>*:last-child]:w-full"
            >
              {token.address.toLowerCase() === NATIVE_TOKEN.toLowerCase() ? (
                <ChainLogo chainId={1} />
              ) : (
                <Image
                  src={"/assets/img/logo/usdc.svg"}
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
