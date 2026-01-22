"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { vestingAbi } from "../../../../lib/vesting/vestingAbi";
import { ProcessedSchedule } from "../../../../lib/vesting/types";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Address, parseEther, weiUnits } from "viem";
import { formatEther, JB_CHAINS } from "juice-sdk-core";
import { formatDate, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { preventMinusKey } from "@/components/PayInput";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";


export function VestingDetailsDialog({ children, schedule }: { children: React.ReactNode, schedule: ProcessedSchedule }) {
  const { address } = useAccount();
  const userChainId = useChainId();
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseAmount, setReleaseAmount] = useState("");

  const vestingContractAddress = useLegacyProjectStore(state => state.vestingContractAddress);
  const vestingChainId = useLegacyProjectStore(state => state.vestingChainId);
  const isOwner = useLegacyProjectStore(state => state.isOwner);

  const startDateMs = Number(schedule.start) * 1000;
  const startDate = new Date(startDateMs);

  const cliffEndMs = Number(schedule.cliff) * 1000;
  const cliffEndDate = new Date(cliffEndMs);

  const durationMs = Number(schedule.duration) * 1000;
  const endDateMs = startDateMs + durationMs;
  const endDate = new Date(endDateMs);

  const today = new Date;
  const isCompleted = today.getTime() > endDateMs;

  const canReleaseTokens = 
    address?.toLowerCase() === schedule.beneficiary.toLowerCase() && 
    schedule.status == 0 &&
    schedule.released < schedule.amountTotal &&
    schedule.releasableAmount > 0n;

  const disableRelease = Number(releaseAmount) > Number(formatEther(schedule.releasableAmount));

  const releaseTokens = async () => {
    try {
      setIsReleasing(true);

      if (!vestingContractAddress || !vestingChainId) throw new Error();
      if (userChainId !== vestingChainId) {
        await switchChainAsync({ chainId: vestingChainId });
      };

      const amount = parseEther(releaseAmount);

      await writeContractAsync({
        address: vestingContractAddress,
        abi: vestingAbi,
        chainId: vestingChainId,
        functionName: "release",
        args: [schedule.id as `0x${string}`, amount],
      });

      toast({
        title: "Tokens Released",
        description: "Successfully released your tokens."
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't release tokens",
        description: "Failed to release tokens, report this and try again later."
      });
    } finally {
      setIsReleasing(false);
    }
  };


  const revokeSchedule = async () => {
    try {
      setIsRevoking(true);

      if (!vestingContractAddress || !vestingChainId) throw new Error();
      if (userChainId !== vestingChainId) {
        await switchChainAsync({ chainId: vestingChainId });
      };

      await writeContractAsync({
        address: vestingContractAddress,
        abi: vestingAbi,
        chainId: vestingChainId,
        functionName: "revoke",
        args: [schedule.id as `0x${string}`],
      });

      toast({
        title: "Schedule Revoked",
        description: "Successfully revoked vesting schedule."
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't revoke schedule",
        description: "Failed to revoke schedule, report this and try again later."
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="flex items-center justify-between text-lg font-semibold">
            Vesting Schedule Details

            {schedule.status === 0 ? (
              <div className="flex">
                <p className="bg-(--input) py-1 px-2 font-normal rounded-full text-xs uppercase">
                  {isCompleted ?
                    " Completed" : 
                    schedule.revokable ?
                      "Active - Revokable" :
                      "Active - Irrevocable"
                  }
                </p>
              </div>
            ) : (
              <div className="flex">
                <p className="bg-red-900 py-1 px-2 font-normal rounded-full text-xs uppercase">
                  Revoked
                </p>
              </div>
            )}
          </Dialog.Title>
          {address?.toLowerCase() === schedule.beneficiary.toLowerCase() && (
            <Dialog.Description className="text-sm text-muted-foreground mt-2">
              This is your vesting schedule, open the "Your Schedules" tab to release your tokens.
            </Dialog.Description>
          )}

          <div className="flex flex-col gap-2 my-4">
            <div className="flex flex-col rounded background-color p-2">
              <p className="text-sm font-light text-muted-foreground">Beneficiary</p>
              <EthereumAddress
                address={schedule.beneficiary as Address} 
                chain={JB_CHAINS[vestingChainId ?? 1].chain}
                short
                withEnsName
              />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2">
              <div className="flex flex-col rounded background-color p-2">
                <p className="text-sm font-light text-muted-foreground">Total Tokens</p>
                <p>
                  {formatNumber(
                    Number(formatEther(schedule.amountTotal))
                  )}
                </p>
              </div>

              <div className="flex flex-col rounded background-color p-2">
                <p className="text-sm font-light text-muted-foreground">Releasable Tokens</p>
                <p>
                  {formatNumber(
                    Number(formatEther(schedule.releasableAmount))
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col rounded background-color p-2">
              <p className="text-sm font-light text-muted-foreground">Released Tokens</p>
              <p>
                {formatNumber(
                  Number(formatEther(schedule.released))
                )}
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2">
              <div className="flex flex-col rounded background-color p-2">
                <p className="text-sm font-light text-muted-foreground">Start Date</p>
                <p>{formatDate(startDate, true)}</p>
              </div>

              <div className="flex flex-col rounded background-color p-2">
                <p className="text-sm font-light text-muted-foreground">Cliff End</p>
                <p>
                  {cliffEndMs === startDateMs ?
                    "No Cliff" :
                    formatDate(cliffEndDate, true)
                  }
                </p>
              </div>

              <div className="flex flex-col rounded background-color p-2">
                <p className="text-sm font-light text-muted-foreground">End Date</p>
                <p>{formatDate(endDate, true)}</p>
              </div>
            </div>

            {canReleaseTokens && !!vestingChainId && (
              <div className="flex flex-col rounded background-color p-2">
                <p className="text-sm font-light text-muted-foreground">Release Specified Amount</p>
                <div className="flex items-center gap-1 mt-1">
                  <Input 
                    onChange={(e) => setReleaseAmount(e.target.value)}
                    value={releaseAmount}
                    onKeyDown={preventMinusKey}
                    className="w-full text-sm"
                    placeholder="Amount to release"
                  />
                  <ButtonWithWallet
                    targetChainId={vestingChainId}
                    onClick={releaseTokens}
                    disabled={disableRelease}
                    loading={isReleasing}
                    className="w-fit text-nowrap"
                  >
                    Release
                  </ButtonWithWallet>
                </div>
              </div>
            )}

            {isOwner && !!vestingChainId && (
              <ButtonWithWallet
                targetChainId={vestingChainId}
                onClick={revokeSchedule}
                disabled={schedule.status !== 0}
                loading={isRevoking}
                variant={"destructive"}
              >
                Revoke Schedule
              </ButtonWithWallet>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Dialog.Close asChild>
              <Button variant={"secondary"}>
                Close
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
