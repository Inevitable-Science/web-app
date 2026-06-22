"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatHexEther } from "@/lib/utils";
import { JB_CHAINS, JBChainId, SuckerPair } from "juice-sdk-core";
import { ChainPayment } from "juice-sdk-react";
import { ChainLogo } from "./ChainLogo";

interface Props {
  payments: ChainPayment[] | undefined;
  selectedPayment: ChainPayment | null;
  onSelectPayment: (payment: ChainPayment) => void;
  disabled?: boolean;
}

export function RelayrPaymentSelect(props: Props) {
  const {
    payments,
    selectedPayment,
    onSelectPayment,
    disabled = false,
  } = props;

  if (payments && payments.length > 0) {
    return (
      <div>
        {/* TODO: review if this calculation of the gas amount is correct with relayr */}
        <div className="mb-1 text-left text-sm">
          Pay {formatHexEther(payments[0].amount)} ETH on:
        </div>
        <div className="max-w-sm">
          <Select
            onValueChange={(v) =>
              onSelectPayment(payments.find((p) => p.chain === Number(v))!)
            }
            value={selectedPayment?.chain.toString()}
            disabled={disabled}
          >
            <SelectTrigger className="background-color m-0 h-[38px] rounded-full border-none p-2">
              {selectedPayment ? (
                <div className="flex items-center gap-1.5">
                  <ChainLogo
                    height={24}
                    width={24}
                    chainId={selectedPayment.chain}
                  />
                  {JB_CHAINS[selectedPayment.chain as JBChainId].name}
                </div>
              ) : (
                "Select Chain"
              )}
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {payments.map((payment) => (
                <SelectItem
                  className="[&>*:last-child]:flex [&>*:last-child]:w-full [&>*:last-child]:items-center [&>*:last-child]:gap-1.5"
                  value={payment.chain.toString()}
                  key={payment.chain}
                >
                  <ChainLogo chainId={payment.chain} />
                  {JB_CHAINS[payment.chain as JBChainId].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
}
