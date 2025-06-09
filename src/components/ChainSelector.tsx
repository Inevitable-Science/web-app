import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { ChainLogo } from "./ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
      <SelectTrigger className="w-fit h-fit border-none background-color rounded-full p-1.5 text-xs text-color">
        <SelectValue placeholder="Select chain">
          {value ? (
            <div className="mr-1">
              <ChainLogo chainId={Number(value) as JBChainId} height={24} width={24} />
              {/*<span>{JB_CHAINS[value].name}</span>*/}
            </div>
          ) : (
            <span>Select chain</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {chainOptions.map((chainId) => (
          <SelectItem
            key={chainId}
            value={chainId.toString()}
          >
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
