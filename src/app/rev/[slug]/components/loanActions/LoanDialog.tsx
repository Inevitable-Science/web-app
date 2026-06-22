"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex h-[32px] items-center gap-2"
          variant={"gunmetalArrow"}
        >
          Actions
          <ArrowRight height="18" width="18" />
        </Button>
      </DialogTrigger>

      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
}
