"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { JBChainId } from "@bananapus/nana-sdk-react";
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

export interface LoanTabProps {
  loan: LoanType;
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export function LoanDialog({ loan }: { loan: LoanType }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"repay" | "refinance">("repay");
  const [isSigning, setIsSigning] = useState(false);

  const handleDialogToggle = (open: boolean) => {
    if (!open && isSigning) return; // don't close mid-signature
    setIsModalOpen(open);
  };

  const tabProps: LoanTabProps = { loan, isSigning, setIsSigning };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleDialogToggle}>
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
              disabled={isSigning}
            >
              Repay
            </Button>
            <Button
              className={`${activeTab === "refinance" && "background-color"} rounded-t-lg rounded-b-none p-3 hover:bg-transparent hover:underline`}
              onClick={() => setActiveTab("refinance")}
              disabled={isSigning}
            >
              Refinance
            </Button>
          </div>

          <div
            className={`${activeTab === "refinance" ? "rounded-xl" : "rounded-[0_8px_8px_8px]"} background-color p-3 transition-all`}
          >
            {activeTab === "repay" && <RepayTab {...tabProps} />}
            {activeTab === "refinance" && <RefinanceTab {...tabProps} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
