import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        className="text-color h-fit w-fit rounded-full border-none bg-grey-450 p-1.5 text-xs"
        aria-label="Select Chain"
      >
        <SelectValue placeholder="Select chain">
          {value ? (
            <div className="flex items-center gap-2 font-light">
              <ChainLogo
                chainId={Number(value) as JBChainId}
                height={24}
                width={24}
              />
              <p className="mr-1 text-[18px]">
                {JB_CHAINS[value].nativeTokenSymbol}
              </p>
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
