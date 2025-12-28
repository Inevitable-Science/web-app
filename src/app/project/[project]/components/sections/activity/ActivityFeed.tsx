"use client";
import { useState } from "react";
import { useLegacyProjectStore } from "../../../DataProvider";
import EtherscanLink from "@/components/EtherscanLink";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Address } from "viem";
import { mainnet } from "viem/chains";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { EthereumAddress } from "@/components/EthereumAddress";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { useFetchLegacyActivity } from "@/hooks/queries/useFetchLegacyActivity";

function getRelativeTime(dateString: string): string {
  // Step 1: Parse the date string
  const parsedDate = new Date(dateString); // e.g., "15 Jan 2024 19:54:11 GMT"

  // Step 2: Format the relative time
  const relativeTime = formatDistance(parsedDate, new Date(), {
    addSuffix: true,
  });

  return relativeTime;
}


export function ActivityFeed() {
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const [page, setPage] = useState<number>(1);

  const daoName = daoData?.name;
  const { data, isLoading, isError } = useFetchLegacyActivity(daoName, page);

  return (
    <div>
      {isLoading ? (
        <div className="align-center mt-[10vh] flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <>
          {isError || !data ? (
            <div>
              <p className="mt-12 text-center text-muted-foreground">
                Unable To Fetch DAO Activity
              </p>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Please Try Again Later
              </p>
            </div>
          ) : (
            <>
              {data.data.map(tx => (
                <div
                  key={tx.transaction_hash}
                  className="border-color mb-1 min-h-[80px] border-b pb-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-light text-grey-50">PAID</h3>
                    <div className="text-md mb-2 font-light text-grey-50">
                      <EtherscanLink
                        type="tx"
                        value={tx.transaction_hash}
                        chain={mainnet}
                      >
                        {getRelativeTime(tx.date)}
                      </EtherscanLink>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-color font-light">
                      Ξ{tx.eth_paid}
                    </div>

                    {tokenAnalytics?.selectedToken.chain_id && (
                      <div className="text-md flex flex-wrap items-center gap-1 font-light text-grey-100">
                        <EthereumAddress
                          address={tx.beneficiary as Address}
                          chain={
                            JB_CHAINS[
                              tokenAnalytics?.selectedToken
                                .chain_id as JBChainId
                            ].chain
                          }
                          short
                          withEnsName
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {data && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-sm font-light text-muted-foreground">
                    Page {page} out of {data?.totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: 3 }, (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 1, data.totalPages - 2)
                      );
                      const pageNum = start + i;
                      if (pageNum > data.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          className={`${pageNum === page ? "border-color border" : ""} font-light`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPage((prev) => Math.min(data.totalPages, prev + 1))
                      }
                      disabled={page === data?.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">
                    Showing {data.limit} items out of {data.totalItems}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
