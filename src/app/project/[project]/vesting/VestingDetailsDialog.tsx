"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { vestingAbi } from "@/lib/vesting/vestingAbi";
import { ProcessedSchedule } from "@/lib/vesting/types";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Address, parseEther, weiUnits } from "viem";
import { formatEther, JB_CHAINS } from "juice-sdk-core";
import { formatDate, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { preventMinusKey } from "@/components/PayInput";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";

export function VestingDetailsDialog({
  children,
  schedule,
}: {
  children: React.ReactNode;
  schedule: ProcessedSchedule;
}) {
  const { address } = useAccount();
  const userChainId = useChainId();
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseAmount, setReleaseAmount] = useState("");

  const vestingContractAddress = useLegacyProjectStore(
    (state) => state.vestingContractAddress
  );
  const vestingChainId = useLegacyProjectStore((state) => state.vestingChainId);
  const isOwner = useLegacyProjectStore((state) => state.isOwner);

  const startDateMs = Number(schedule.start) * 1000;
  const startDate = new Date(startDateMs);

  const cliffEndMs = Number(schedule.cliff) * 1000;
  const cliffEndDate = new Date(cliffEndMs);

  const durationMs = Number(schedule.duration) * 1000;
  const endDateMs = startDateMs + durationMs;
  const endDate = new Date(endDateMs);

  const today = new Date();
  const isCompleted = today.getTime() > endDateMs;

  const canReleaseTokens =
    address?.toLowerCase() === schedule.beneficiary.toLowerCase() &&
    schedule.status == 0 &&
    schedule.released < schedule.amountTotal &&
    schedule.releasableAmount > 0n;

  const disableRelease =
    Number(releaseAmount) > Number(formatEther(schedule.releasableAmount));

  const releaseTokens = async () => {
    try {
      setIsReleasing(true);

      if (!vestingContractAddress || !vestingChainId) throw new Error();
      if (userChainId !== vestingChainId) {
        await switchChainAsync({ chainId: vestingChainId });
      }

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
        description: "Successfully released your tokens.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't release tokens",
        description:
          "Failed to release tokens, report this and try again later.",
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
      }

      await writeContractAsync({
        address: vestingContractAddress,
        abi: vestingAbi,
        chainId: vestingChainId,
        functionName: "revoke",
        args: [schedule.id as `0x${string}`],
      });

      toast({
        title: "Schedule Revoked",
        description: "Successfully revoked vesting schedule.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't revoke schedule",
        description:
          "Failed to revoke schedule, report this and try again later.",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogTitle className="flex items-center justify-between gap-2">
          Schedule Details
          {schedule.status === 0 ? (
            <div className="flex">
              <p className="rounded-full bg-(--input) px-2 py-1 text-xs font-normal text-nowrap uppercase">
                {isCompleted
                  ? " Completed"
                  : schedule.revokable
                    ? "Active - Revokable"
                    : "Active - Irrevocable"}
              </p>
            </div>
          ) : (
            <div className="flex">
              <p className="rounded-full bg-red-900 px-2 py-1 text-xs font-normal uppercase">
                Revoked
              </p>
            </div>
          )}
        </DialogTitle>
        {address?.toLowerCase() === schedule.beneficiary.toLowerCase() && (
          <DialogDescription>
            This is your vesting schedule, open the "Your Schedules" tab to
            release all of your tokens, alternatively unlock your tokens below.
          </DialogDescription>
        )}

        <div className="my-4 flex flex-col gap-2">
          <div className="background-color flex flex-col rounded p-2">
            <p className="text-muted-foreground text-sm font-light">
              Beneficiary
            </p>
            <EthereumAddress
              address={schedule.beneficiary as Address}
              chain={JB_CHAINS[vestingChainId ?? 1].chain}
              short
              withEnsName
            />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
            <div className="background-color flex flex-col rounded p-2">
              <p className="text-muted-foreground text-sm font-light">
                Total Tokens
              </p>
              <p>{formatNumber(formatEther(schedule.amountTotal))}</p>
            </div>

            <div className="background-color flex flex-col rounded p-2">
              <p className="text-muted-foreground text-sm font-light">
                Releasable Tokens
              </p>
              <p>{formatNumber(formatEther(schedule.releasableAmount))}</p>
            </div>
          </div>

          <div className="background-color flex flex-col rounded p-2">
            <p className="text-muted-foreground text-sm font-light">
              Released Tokens
            </p>
            <p>{formatNumber(formatEther(schedule.released))}</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
            <div className="background-color flex flex-col rounded p-2">
              <p className="text-muted-foreground text-sm font-light">
                Start Date
              </p>
              <p>{formatDate(startDate, true)}</p>
            </div>

            <div className="background-color flex flex-col rounded p-2">
              <p className="text-muted-foreground text-sm font-light">
                Cliff End
              </p>
              <p>
                {cliffEndMs === startDateMs
                  ? "No Cliff"
                  : formatDate(cliffEndDate, true)}
              </p>
            </div>

            <div className="background-color flex flex-col rounded p-2">
              <p className="text-muted-foreground text-sm font-light">
                End Date
              </p>
              <p>{formatDate(endDate, true)}</p>
            </div>
          </div>

          {canReleaseTokens && !!vestingChainId && (
            <div className="background-color flex flex-col rounded p-2">
              <p className="text-muted-foreground text-sm font-light">
                Release Specified Amount
              </p>
              <div className="mt-1 grid grid-cols-[1fr_auto] items-center gap-1">
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
          <DialogClose />
        </div>
      </DialogContent>
    </Dialog>
  );
}
