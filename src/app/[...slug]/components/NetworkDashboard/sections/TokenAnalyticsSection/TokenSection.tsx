"use client";

import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenResponse } from '@/lib/types/AnalyticTypes';
import {
  JBChainId,
  useJBChainId,
  useSuckers,
} from "juice-sdk-react";
import { JB_CHAINS } from "juice-sdk-core";
import Link from "next/link";

import { Address } from "viem";
import { LinkIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

interface DescriptionInterface {
  treasuryHoldings: string;
  assetsUnderManagement: string | number;
  totalHolders: string;
  totalSupply: string | number;
  latestPrice: number;
  latestMarketCap: number;
  tokenName: string;
}

interface DescriptionSectionProps {
  data: TokenResponse | null;
  descriptionData: DescriptionInterface | null;
}

export function TokenSection({ data, descriptionData }: DescriptionSectionProps) {
  const chainId = useJBChainId();

  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;

  return (
    <section>
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-grey-450 p-[12px] rounded-2xl">
          <h3 className="text-grey-50 uppercase text-sm mb-[8px] py-1">Top Holders</h3>
          
        </div>

        <div className="bg-grey-450 p-[12px] rounded-2xl">
          <h3 className="text-xl pt-1 pb-3">AUM/MC Ratio</h3>
          <div className="text-sm flex gap-2 items-baseline">
            {suckers?.map((pair) => {
              if (!pair) return null;

              const networkSlug =
                JB_CHAINS[pair?.peerChainId as JBChainId].slug;
              return (
                <Link
                  className="underline"
                  key={networkSlug}
                  href={`/${networkSlug}:${pair.projectId}`}
                >
                  <ChainLogo
                    chainId={pair.peerChainId as JBChainId}
                    width={18}
                    height={18}
                  />
                </Link>
              );
            })}
          </div>
        </div>
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </section>
  )
}