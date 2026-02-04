"use client";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { JBChainId } from "juice-sdk-react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { RepayTab } from "./RepayTab";
import { Address } from "viem";
import { RefinanceTab } from "./RefinanceTab";

export interface LoanType {
  borrowAmount: bigint;
  collateral: bigint;
  prepaidDuration: number;
  projectId: number;
  terminal: Address;
  token: Address;
  chainId: JBChainId;
  createdAt: number;
  id: any;
}

export function LoanDialog({ loan }: { loan: LoanType }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"repay" | "refinance">("repay");

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        <Button
          className="flex h-[32px] items-center gap-2"
          variant={"gunmetalArrow"}
        >
          Actions
          <ArrowRight height="18" width="18" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content className="bg-grey-450 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl px-6 pt-4 pb-6 shadow-lg duration-200">
          <div>
            <div>
              <Button
                className={`${activeTab === "repay" && "background-color"} rounded-t-lg rounded-b-none p-3 hover:bg-transparent hover:underline`}
                onClick={() => setActiveTab("repay")}
              >
                Repay
              </Button>
              <Button
                className={`${activeTab === "refinance" && "background-color"} rounded-t-lg rounded-b-none p-3 hover:bg-transparent hover:underline`}
                onClick={() => setActiveTab("refinance")}
              >
                Refinance
              </Button>
            </div>

            <div
              className={`${activeTab === "refinance" ? "rounded-xl" : "rounded-[0_8px_8px_8px]"} background-color p-3 transition-all`}
            >
              {activeTab === "repay" && <RepayTab loan={loan} />}
              {activeTab === "refinance" && <RefinanceTab loan={loan} />}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
