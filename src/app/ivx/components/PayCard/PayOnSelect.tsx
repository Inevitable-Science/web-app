import { useEffect } from "react";
import { JB_CHAINS } from "juice-sdk-core";
import { JBChainId, useJBChainId, useSuckers } from "juice-sdk-react";
import { useSelectedSucker } from "../../SelectedSuckerContext";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ChainLogo } from "@/components/ChainLogo";

export function PayOnSelect() {
  const suckersQuery = useSuckers();
  const chainId = useJBChainId();
  const suckers = suckersQuery.data;
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  useEffect(() => {
    const defaultSucker = suckers?.find(
      (sucker) => chainId === sucker.peerChainId
    );
    setSelectedSucker(defaultSucker);
  }, [suckers, chainId, setSelectedSucker]);

  if (!suckers || suckers.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-1">
      <Select
        onValueChange={(value: string) => {
          setSelectedSucker(
            suckers?.find((sucker) => sucker.peerChainId === Number(value) as JBChainId) || undefined
          );
        }}
        defaultValue={selectedSucker?.peerChainId.toString()}
      >
        <SelectTrigger className="text-md text-black-700 h-auto border-none bg-transparent p-0">
          <SelectValue placeholder="Chain" />
        </SelectTrigger>
        <SelectContent>
          {suckers?.map((sucker) => (
            <SelectItem key={sucker.peerChainId} value={sucker.peerChainId.toString()}>
              <div className="flex items-center gap-2">
                <ChainLogo
                  chainId={sucker.peerChainId as JBChainId}
                  width={18}
                  height={18}
                />
                {JB_CHAINS[sucker.peerChainId as JBChainId]?.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}