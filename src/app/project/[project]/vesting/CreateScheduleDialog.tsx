"use client";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAccount, useWriteContract } from "wagmi";
import { vestingAbi } from "@/lib/vesting/vestingAbi";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import { useToast } from "@/components/ui/use-toast";
import { preventMinusKey } from "@/components/PayInput";
import { Calendar } from "@/components/ui/calendar";
import { Address, formatEther, getContract, isAddress, parseUnits } from "viem";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { formatDate, formatNumber } from "@/lib/utils";
import { getViemPublicClient, ViemChainIdType } from "@/lib/wagmiConfig";

export function CreateScheduleDialogue() {
  const vestingContractAddress = useLegacyProjectStore(
    (state) => state.vestingContractAddress
  );
  const vestingChainId = useLegacyProjectStore((state) => state.vestingChainId);
  const canCreate = useLegacyProjectStore((state) => state.canCreate);

  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [withdrawableAmount, setWithdrawableAmount] = useState<number | null>(
    null
  );

  // Form Data
  const [beneficiary, setBeneficiary] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [cliff, setCliff] = useState("");
  const [isRevokable, setIsRevokable] = useState(true);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const formattedAmount = parseUnits(tokenAmount, 18);
  const monthInSeconds = 60 * 60 * 24 * 30.5;

  const startTimestamp = startDate ? Math.floor(startDate.getTime() / 1000) : 0;
  const endTimestamp = endDate ? Math.floor(endDate.getTime() / 1000) : 0;

  const cliffSeconds = cliff ? Number(cliff) * monthInSeconds : 0;

  const enableCreateButton =
    !!beneficiary && !!tokenAmount && !!startDate && !!endDate;

  useEffect(() => {
    const fetchWithdrawableAmount = async () => {
      try {
        const client = getViemPublicClient(vestingChainId as ViemChainIdType); // this is safe as it returns earlier (within page.tsx) if no vesting contract
        const vestingContract = getContract({
          address: vestingContractAddress as Address,
          abi: vestingAbi,
          client,
        });

        const availableTokens =
          await vestingContract.read.getWithdrawableAmount();
        const tokenAmt = Number(formatEther(availableTokens));
        setWithdrawableAmount(tokenAmt);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWithdrawableAmount();
  }, []);

  type ValidationResult = { ok: true } | { ok: false; message: string };

  const validateScheduleInputs = (): ValidationResult => {
    switch (true) {
      case !isAddress(beneficiary):
        return {
          ok: false,
          message: "Beneficiary must be a valid Ethereum address.",
        };

      case !withdrawableAmount || Number(tokenAmount) > withdrawableAmount:
        return {
          ok: false,
          message: "Not enough tokens available to create this schedule.",
        };

      case !startTimestamp || startTimestamp <= 0:
        return {
          ok: false,
          message: "Start date must be a valid future timestamp.",
        };

      case !endTimestamp || endTimestamp <= startTimestamp:
        return { ok: false, message: "End date must be after the start date." };

      case cliffSeconds < 0:
        return { ok: false, message: "Cliff must be a positive duration." };

      case cliffSeconds >= endTimestamp - startTimestamp:
        return {
          ok: false,
          message: "Cliff must be shorter than the vesting duration.",
        };

      case formattedAmount <= 0n:
        return {
          ok: false,
          message: "Token amount must be greater than zero.",
        };

      default:
        return { ok: true };
    }
  };

  const createSchedule = async () => {
    try {
      if (!isConnected) return;
      if (!vestingContractAddress || !vestingChainId) throw new Error();

      setIsCreating(true);

      const validation = validateScheduleInputs();
      if (!validation.ok) {
        toast({
          title: "Invalid Input",
          description: validation.message,
        });
        return;
      }

      await writeContractAsync({
        functionName: "createVestingSchedule",
        abi: vestingAbi,
        address: vestingContractAddress,
        chainId: vestingChainId,
        args: [
          beneficiary as `0x${string}`,
          BigInt(startTimestamp as number),
          BigInt(cliffSeconds as number),
          BigInt((endTimestamp - startTimestamp) as number), // duration in seconds
          BigInt(1), // slice period
          isRevokable,
          formattedAmount,
        ],
      });
      toast({
        title: "Schedule Created",
        description:
          "Schedule successfully created, it may take up to 15 minutes to appear.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed To Create Schedule",
        description:
          "Couldn't create schedule, report this error or refresh and try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!canCreate) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant={"accent"}>Create Schedule</Button>
      </DialogTrigger>

        <DialogContent>
          <DialogTitle>
            Create Vesting Schedule
          </DialogTitle>
          {withdrawableAmount !== null && (
            <DialogDescription>
              Max Token Amount: ~{formatNumber(withdrawableAmount)}
            </DialogDescription>
          )}

          <div className="my-4 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm">Beneficiary/Schedule Holder</p>
              <Input
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="0x1234...4321"
                maxLength={42}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Token Amount</p>
              <Input
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                onKeyDown={preventMinusKey}
                placeholder="100"
                maxLength={16}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">
                Start Date - {formatDate(startDate, true)}
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"secondary"}
                    className="border-color w-fit border"
                  >
                    {startDate
                      ? `Edit Start Date - (${formatDate(startDate, true)})`
                      : "Set Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="rounded-lg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">End Date - {formatDate(endDate, true)}</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"secondary"}
                    className="border-color w-fit border"
                  >
                    {endDate
                      ? `Edit End Date - (${formatDate(endDate, true)})`
                      : "Set End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="rounded-lg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Cliff (Months)</p>
              <Input
                value={cliff}
                onChange={(e) => setCliff(e.target.value)}
                onKeyDown={preventMinusKey}
                placeholder="12 - (0 by default)"
                maxLength={16}
              />
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <Checkbox.Root
                id="terms"
                checked={isRevokable}
                onCheckedChange={(checked) => setIsRevokable(Boolean(checked))}
                className="peer data-[state=checked]:bg-cerulean h-4 w-4 shrink-0 rounded-xs border border-slate-400 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
              >
                <Checkbox.Indicator className="flex items-center justify-center text-current">
                  <Check className="h-4 w-4" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label
                htmlFor="terms"
                className="cursor-pointer text-sm select-none"
              >
                Revokable - Allows the schedule to be revoked in future
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <DialogClose />
            <ButtonWithWallet
              targetChainId={vestingChainId ?? 1}
              disabled={!enableCreateButton}
              loading={isCreating}
              onClick={createSchedule}
              variant={"accent"}
            >
              Create
            </ButtonWithWallet>
          </div>
        </DialogContent>
    </Dialog>
  );
}
