{/*"use client";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectGroup } from "@/components/ui/select";
import { Label } from "@radix-ui/react-select";
import z from "zod";
import { useAccount, useChainId, useSwitchAccount, useSwitchChain, useWriteContract } from "wagmi";
import { abi } from "./vestingAbi";

const formSchema = z
  .object({
    beneficiary: z
      .string()
      .min(42, {
        message: "Invalid Ethereum address",
      })
      .startsWith("0x", {
        message: "Invalid Ethereum address",
      }),
    amount: z.coerce.number().positive().min(0, {
      message: "Token amount must be greater than 0",
    }),
    start: z.date({
      message: "A start date is required",
    }),
    end: z.date({
      message: "An end date is required",
    }),
    cliffMonths: z.coerce.number().int(),
    revokable: z.boolean(),
  })
  .refine((data) => data.end > data.start, {
    message: "End date cannot be earlier or the same as the start date.",
    path: ["end"],
  })

export function CreateScheduleDialogue() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Data
  const [beneficiary, setBeneficiary] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [cliff, setCliff] = useState("");
  const [isRevokable, setIsRevokable] = useState(false);

  // EDIT THIS UPON INSTALATION OF SHADCN CALENDAR

  const createSchedule = async () => {
    try {
      if (!isConnected) return;

      const txn = await writeContractAsync({
        functionName: "createVestingSchedule",
        abi,
        address: 
        args: [
          beneficiary as `0x${string}`,
          BigInt(startTimestamp as number),
          BigInt(cliffSeconds as number),
          BigInt((endTimestamp - startTimestamp) as number),
          BigInt(1),
          values.revokable as boolean,
          formattedAmount,
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant={"accent"}
        >
          Create Schedule
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content
          //className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          className="bg-grey-450 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold">
            Create Vesting Schedule
          </Dialog.Title>

          <div className="flex flex-col gap-2 my-4">
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
                placeholder="100"
                maxLength={16}
              />
            </div>

            <p>DATES</p>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Cliff (Months)</p>
              <Input
                value={cliff} 
                onChange={(e) => setCliff(e.target.value)} 
                placeholder="12"
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
                className="text-sm"
              >
                Revokable - Allows the schedule to be revoked in future
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Dialog.Close asChild>
              <Button variant={"secondary"}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant={"accent"}>
              Create
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
*/}