"use client";
import { useEffect, useState } from "react";
import { Address, formatEther, getContract } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { JB_CHAINS } from "juice-sdk-core";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import { getViemPublicClient, ViemChainIdType } from "@/lib/wagmiConfig";
import { ProcessedSchedule, Schedule } from "@/lib/vesting/types";
import { vestingAbi } from "@/lib/vesting/vestingAbi";
import { EthereumAddress } from "@/components/EthereumAddress";
import { formatDate, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { VestingDetailsDialog } from "./VestingDetailsDialog";
import { CreateScheduleDialogue } from "./CreateScheduleDialog";
import { Button } from "@/components/ui/button";
import { AlarmClockOff, ArrowRightIcon } from "lucide-react";

type TabType = "allSchedules" | "yourSchedules";

export function SchedulesSection({
  schedules,
}: {
  schedules: ProcessedSchedule[];
}) {
  const { address, isConnected } = useAccount();
  const userChainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { toast } = useToast();

  const contractAddress = useLegacyProjectStore(
    (state) => state.vestingContractAddress
  );
  const chainId = useLegacyProjectStore((state) => state.vestingChainId);

  // User State
  const hasSchedule = useLegacyProjectStore((state) => state.hasSchedule);
  const setHasSchedule = useLegacyProjectStore((state) => state.setHasSchedule);

  const [activeTab, setActiveTab] = useState<TabType>("allSchedules");
  const [userSchedules, setUserSchedules] = useState<ProcessedSchedule[]>([]);
  const [isReleasingAll, setIsReleasingAll] = useState(false);

  const activeSchedules = userSchedules.filter(
    (schedule) => schedule.status === 0
  );
  const totalVestedTokens = activeSchedules.reduce((acc, schedule) => {
    return Number(formatEther(schedule.amountTotal)) + acc;
  }, 0);
  const totalReleasableTokens = activeSchedules.reduce((acc, schedule) => {
    return Number(formatEther(schedule.releasableAmount)) + acc;
  }, 0);
  const totalReleasedTokens = userSchedules.reduce((acc, schedule) => {
    return Number(formatEther(schedule.released)) + acc;
  }, 0);

  const client = getViemPublicClient(chainId as ViemChainIdType); // this is safe as it returns earlier (within page.tsx) if no vesting contract
  const vestingContract = getContract({
    address: contractAddress as Address,
    abi: vestingAbi,
    client,
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        if (!address || !contractAddress) return;

        const filteredUserSchedules = schedules.filter(
          (s) => s.beneficiary === address
        );
        if (filteredUserSchedules.length === 0) {
          setHasSchedule(false);
          return;
        }

        const scheduleCount =
          await vestingContract.read.holdersVestingScheduleCount([address]);

        if (scheduleCount === 0n) {
          setHasSchedule(false);
          return;
        }

        let userSchedulesArr: ProcessedSchedule[] = [];

        /*for (const schedule of filteredUserSchedules) {
          userSchedulesArr.push(schedule);
        }

        setUserSchedules(userSchedulesArr);*/

        for (let i = 0; i < Number(scheduleCount); i++) {
          const [schedule, scheduleId]: [Schedule, `0x${string}`] =
            await Promise.all([
              vestingContract.read.getVestingScheduleByAddressAndIndex([
                address,
                BigInt(i),
              ]),
              vestingContract.read.computeVestingScheduleIdForAddressAndIndex([
                address,
                BigInt(i),
              ]),
            ]);

          let releasableAmount = BigInt(0);
          if (schedule.status == 0) {
            releasableAmount =
              await vestingContract.read.computeReleasableAmount([scheduleId]);
          }

          userSchedulesArr.push({
            ...schedule,
            id: scheduleId,
            releasableAmount,
          });
        }

        setUserSchedules(userSchedulesArr);
        setHasSchedule(true);
      } catch (e) {
        console.error(e);
      }
    };

    fetchSchedules();
  }, [address, isConnected, setHasSchedule]);

  const releaseAllTokens = async () => {
    try {
      if (!address || !contractAddress || !chainId) return;
      setIsReleasingAll(true);

      if (userChainId !== chainId) {
        await switchChainAsync({ chainId });
      }

      await writeContractAsync({
        abi: vestingAbi,
        functionName: "releaseAvailableTokensForHolder",
        chainId: chainId,
        address: contractAddress,
        args: [address],
      });

      toast({
        title: "Released All Tokens",
        description: "Successfully release all tokens.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't Release Tokens",
        description:
          "Failed to release all tokens, refresh the page and try again.",
      });
      return;
    } finally {
      setIsReleasingAll(false);
    }
  };

  return (
    <>
      <div className="bg-grey-450 mt-4 rounded-2xl p-[12px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setActiveTab("allSchedules")}
              className={`w-[125px] cursor-pointer rounded-none border-b px-2 pb-2 text-sm select-none hover:bg-transparent ${
                activeTab === "allSchedules"
                  ? "border-primary font-medium"
                  : "text-muted-foreground border-transparent font-light"
              } `}
            >
              All Schedules
            </Button>
            {hasSchedule && (
              <Button
                onClick={() => setActiveTab("yourSchedules")}
                className={`w-[125px] cursor-pointer rounded-none border-b px-2 pb-2 text-sm select-none hover:bg-transparent ${
                  activeTab === "yourSchedules"
                    ? "border-primary font-medium"
                    : "text-muted-foreground border-transparent font-light"
                } `}
              >
                Your Schedules
              </Button>
            )}
          </div>

          {/* TEMP */}

          <CreateScheduleDialogue />
        </div>

        {activeTab === "allSchedules" ? (
          <>
            <div className="parentTable mt-5 mb-3 grid text-sm">
              <p>Beneficiary</p>
              <p className="tokenAmountTableElement">Token Amount</p>
              <p className="startTableElement">Start</p>
              <p className="endTableElement">End</p>
              <div />
            </div>

            <div className="background-color rounded p-3 text-sm">
              {schedules.length === 0 ? (
                <div className="flex flex-col gap-1 items-center my-4">
                  <AlarmClockOff className="stroke-muted-foreground" height={38} width={38} />
                  <p className="text-muted-foreground">
                    No Vesting Schedules
                  </p>
                </div>
              ) : schedules
                .sort((a, b) => Number(b.amountTotal) - Number(a.amountTotal))
                .map((schedule) => {
                  const startDateMs = Number(schedule.start) * 1000;
                  const startDate = new Date(startDateMs);

                  const durationMs = Number(schedule.duration) * 1000;
                  const endDateMs = startDateMs + durationMs;
                  const endDate = new Date(endDateMs);

                  return (
                    <div
                      key={schedule.id}
                      className="border-grey-450 parentTable grid items-center border-b py-3"
                    >
                      <EthereumAddress
                        address={schedule.beneficiary as Address}
                        chain={JB_CHAINS[chainId as ViemChainIdType].chain}
                        short
                        withEnsName
                      />
                      <p className="tokenAmountTableElement">
                        {formatNumber(
                          Number(formatEther(schedule.amountTotal))
                        )}
                      </p>
                      <p className="startTableElement">
                        {formatDate(startDate, true)}
                      </p>
                      <div className="endTableElement">
                        {schedule.status === 0 ? (
                          <p>{formatDate(endDate, true)}</p>
                        ) : (
                          <div className="flex">
                            <p className="rounded-full bg-red-900 px-2 py-1 text-xs">
                              REVOKED
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <VestingDetailsDialog schedule={schedule}>
                          <button className="bg-gunmetal flex cursor-pointer items-center gap-2 rounded-full px-[12px] py-[6px] font-normal focus:outline-hidden">
                            Details
                            <ArrowRightIcon height="18" width="18" />
                          </button>
                        </VestingDetailsDialog>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="bg-grey-450 my-4 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3 rounded-2xl">
                <div className="background-color rounded-xl p-[16px]">
                  <h3 className="text-xl">{formatNumber(totalVestedTokens)}</h3>
                  <p className="text-muted-foreground font-light uppercase">
                    Locked Tokens
                  </p>
                </div>

                <div className="background-color rounded-xl p-[16px]">
                  <h3 className="text-xl">
                    {formatNumber(totalReleasableTokens)}
                  </h3>
                  <p className="text-muted-foreground font-light uppercase">
                    Releasable Tokens
                  </p>
                </div>

                <div className="background-color rounded-xl p-[16px]">
                  <h3 className="text-xl">
                    {formatNumber(totalReleasedTokens)}
                  </h3>
                  <p className="text-muted-foreground font-light uppercase">
                    Released Tokens
                  </p>
                </div>
              </div>

              {chainId && (
                <ButtonWithWallet
                  targetChainId={chainId}
                  onClick={releaseAllTokens}
                  variant={"accent"}
                  loading={isReleasingAll}
                >
                  Release All Tokens
                </ButtonWithWallet>
              )}

              <div className="parentTable mt-5 mb-3 grid text-sm">
                <p>Beneficiary</p>
                <p className="tokenAmountTableElement">Token Amount</p>
                <p className="startTableElement">Start</p>
                <p className="endTableElement">End</p>
                <div />
              </div>

              <div className="background-color rounded p-3 text-sm">
                {userSchedules
                  .sort((a, b) => Number(b.amountTotal) - Number(a.amountTotal))
                  .map((schedule) => {
                    const startDateMs = Number(schedule.start) * 1000;
                    const startDate = new Date(startDateMs);

                    const durationMs = Number(schedule.duration) * 1000;
                    const endDateMs = startDateMs + durationMs;
                    const endDate = new Date(endDateMs);

                    return (
                      <div
                        key={schedule.id}
                        className="border-grey-450 parentTable grid items-center border-b py-3"
                      >
                        <EthereumAddress
                          address={schedule.beneficiary as Address}
                          chain={JB_CHAINS[chainId as ViemChainIdType].chain}
                          short
                          withEnsName
                        />
                        <p className="tokenAmountTableElement">
                          {formatNumber(formatEther(schedule.amountTotal))}
                        </p>
                        <p className="startTableElement">
                          {formatDate(startDate, true)}
                        </p>
                        <div className="endTableElement">
                          {schedule.status === 0 ? (
                            <p>{formatDate(endDate, true)}</p>
                          ) : (
                            <div className="flex">
                              <p className="rounded-full bg-red-900 px-2 py-1 text-xs">
                                REVOKED
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <VestingDetailsDialog schedule={schedule}>
                            <button className="bg-gunmetal flex cursor-pointer items-center gap-2 rounded-full px-[12px] py-[6px] font-normal focus:outline-hidden">
                              Details
                              <ArrowRightIcon height="18" width="18" />
                            </button>
                          </VestingDetailsDialog>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
      .parentTable {
        grid-template-columns: 3.5fr 3fr 3fr 3fr 96px;
      }
      
      @media (min-width:900px) and (max-width:1230px) {
        .endTableElement {
          display: none;
        }

        .parentTable {
          grid-template-columns: 3.5fr 3fr 3fr 96px;
        }
      }

      @media (min-width: 767px) and (max-width:1150px) {
        .startTableElement, .endTableElement {
          display: none;
        }

        .parentTable {
          grid-template-columns: 3.5fr 3fr 96px;
        }
      }

      @media (max-width:670px) {
        .endTableElement {
          display: none;
        }

        .parentTable {
          grid-template-columns: 3.5fr 3fr 3fr 96px;
        }
      }

      @media (max-width:570px) {
        .startTableElement, .endTableElement {
          display: none;
        }

        .parentTable {
          grid-template-columns: 3.5fr 3fr 96px;
        }
      }

      @media (max-width:420px) {
        .startTableElement, .endTableElement, .tokenAmountTableElement {
          display: none;
        }

        .parentTable {
          grid-template-columns: 3.5fr 96px;
        }
      }
      `}</style>
    </>
  );
}
