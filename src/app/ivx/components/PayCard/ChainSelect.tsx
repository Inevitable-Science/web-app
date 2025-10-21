import { JBChainId } from "juice-sdk-react";
import { ChainLogo } from "@/components/ChainLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Token } from "@/lib/token";
import { useIVXContext } from "../../DataProvider";
import { useSelectedSucker } from "../../SelectedSuckerContext";
import { Address } from "viem";

interface ChainSelectorProps {
  value: Token;
  onChange: (selected: { address: Address; chainId: JBChainId }) => void;
  disabled?: boolean;
  options: Token[];
}

export interface TokenWithChain extends Token {
  chainId: JBChainId;
}

type TokenSelectValue = `${Address}-${JBChainId}`;

export const ChainSelector = ({
  value,
  onChange,
  disabled,
  options,
}: ChainSelectorProps) => {
  const { suckers } = useIVXContext();
  const { selectedSucker } = useSelectedSucker();

  const tokensWithChains: TokenWithChain[] = (suckers ?? []).flatMap(({ peerChainId }) =>
    options.map((token) => ({
      ...token,
      chainId: peerChainId as JBChainId,
    }))
  );

  return (
    <Select
      onValueChange={(value: TokenSelectValue) => {
        const [address, chainIdString] = value.split("-");
        const chainId = Number(chainIdString) as JBChainId;

        onChange({ address: address as Address, chainId });
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
            <div className="flex items-center gap-1 font-light">
              <ChainLogo
                chainId={Number(selectedSucker.peerChainId) as JBChainId}
                height={24}
                width={24}
              />
              <p className="mr-1 text-[18px]">
                {value.symbol}
              </p>
            </div>
          ) : (
            <span>Select chain</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {tokensWithChains.map((token, index) => {
          return (
            <SelectItem
              key={`${token.address}-${token.chainId}-${index}`}
              value={`${token.address}-${token.chainId}` as TokenSelectValue}
              className="[&>*:last-child]:flex [&>*:last-child]:w-full"
            >
              <ChainLogo chainId={token.chainId as JBChainId} />
              <span className="grow ml-2">{token.symbol}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
