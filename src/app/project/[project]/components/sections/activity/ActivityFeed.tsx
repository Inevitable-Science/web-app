"use client"
import { useEffect, useState } from "react"
import { useData } from "../../../DataProvider";
import EtherscanLink from "@/components/EtherscanLink";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import FarcasterAvatar from "@/components/FarcasterAvatar";
import { Address } from "viem";
import { mainnet } from 'viem/chains';
import { formatDistance } from 'date-fns';
import { Button } from "@/components/ui/button";

interface ActivityResponse {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  data: Transaction[];
}

interface Transaction {
  Date: string;
  'ETH paid': string;
  'USD value of ETH paid': string;
  Payer: string;
  Beneficiary: string;
  'Transaction hash': string;
}

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
  const { analyticsData } = useData();

  const [data, setData] = useState<ActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        if(!analyticsData?.daoData?.name) return null;

        const response = await fetch(`https://inev.profiler.bio/activity/${analyticsData?.daoData?.name}?page=${page}&limit=75`);
        
        if(!response.ok) {
          setData(null);
          setError(true);
        }

        const data = await response.json();
        setData(data);

      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        if (isLoading === true) {
          setIsLoading(false);
        }
      }
    };

    fetchActivity();
  }, [page]);

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center align-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <>
        {error || data === null ? (
          <div>
            <p className="text-center text-muted-foreground mt-12">Unable To Fetch DAO Activity</p>
            <p className="text-center text-muted-foreground text-sm mt-1">Please Try Again Later</p>
          </div>
        ) : (
          <div>
            {data.data.map((transaction) => (
              <div key={transaction["Transaction hash"]} className="border-b border-color pb-2 mb-1 min-h-[80px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-grey-50 font-light">PAID</h3>
                  <div className="text-md font-light text-grey-50 mb-2">
                    {/*<EtherscanLink type="tx" value={payEvent.txHash} chain={chain}>
                      {formattedDate}
                    </EtherscanLink>*/}
                    <EtherscanLink type="tx" value={transaction["Transaction hash"]} chain={mainnet}>
                      {getRelativeTime(transaction.Date)}
                    </EtherscanLink>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-color font-light">
                    Ξ{transaction["ETH paid"]}
                  </div>

                  <div className="flex items-center gap-1 font-light text-grey-100 text-md flex-wrap">
                    <FarcasterAvatar
                      address={transaction.Beneficiary as Address}
                      withAvatar={false}
                      short
                      chain={mainnet}
                    />
                  </div>
                </div>
                
                {/*{activityItemData.memo && (
                  <div className="pb-4 mt-1">
                    {isMiniApp ? (
                      <button
                        onClick={() =>
                          composeCast({
                            text: shareText,
                            embeds: [embedUrl],
                          })
                        }
                        className="text-sm text-grey-50 font-light text-left hover:underline"
                      >
                        {activityItemData.memo}
                      </button>
                    ) : (
                      <div className="text-sm text-grey-50 font-light">
                        "{activityItemData.memo}"
                      </div>
                    )}
                  </div>
                )}*/}
              </div>
            ))}

            <div className="flex flex-col items-center gap-2 mt-6">
              <p className="font-light text-sm text-muted-foreground">Page {data.page} out of {data.totalPages}</p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: 3 }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 1, data.totalPages - 2));
                  const pageNum = start + i;
                  if (pageNum > data.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      className="font-light"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
                  disabled={page === data.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-light text-sm text-muted-foreground">Showing {data.limit} items out of {data.totalItems}</p>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  )
}