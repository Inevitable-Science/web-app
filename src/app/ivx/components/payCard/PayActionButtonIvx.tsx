"use client";
import { useMemo, useState } from "react";
import { jbMultiTerminalAbi, NATIVE_TOKEN } from "juice-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
} from "juice-sdk-react";

import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectKitButton } from "connectkit";
import { Address, formatUnits, parseUnits } from "viem";

import { truncateNumber } from "@/lib/utils";
import { Token } from "@/lib/token";
import { getPaymentTerminal } from "@/lib/paymentTerminal";
import { useAllowance } from "@/hooks/PaymentTerminal/useAllowance";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as Checkbox from "@radix-ui/react-checkbox";

import { useToast } from "@/components/ui/use-toast";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { useRulesetData } from "@/hooks/useRulesetData";
import { useFetchOfacStatus } from "@/hooks/queries/useFetchOfacStatus";

const primaryButtonClasses =
  "w-full rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-primary focus:outline-hidden disabled:opacity-50";

const memo = "";

export function PayActionButton({
  amountA,
  amountB,
  paymentToken,
  walletBalance,
  disabled,
}: {
  amountA: bigint;
  amountB: bigint;
  paymentToken: Token;
  walletBalance: Map<string, bigint>;
  disabled?: boolean;
}) {
  // --- 1. HOOKS ---
  const { metadata } = useJBProjectMetadataContext();
  const {
    version,
    projectId: slugDerivedProjectId,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { allRulesets } = useRulesetData({
    projectId: Number(slugDerivedProjectId)
  });
  const baseToken = useProjectBaseToken();
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const { peerChainId: targetChainId, projectId } = selectedSucker;

  const { address, chainId: userChainId, isConnected } = useAccount();
  const { ensureAllowance, isApproving } = useAllowance(targetChainId);
  const { toast } = useToast();

  const {
    data: OfacStatus,
    isLoading: isOfacLoading,
    isError: isOfacError
  } = useFetchOfacStatus(address as Address);
  const showLoading = isOfacLoading || !rulesetMetadata || !allRulesets?.length;
  const {
    data: txHash,
    isPending: isWriteLoading,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const publicClient = usePublicClient();

  // --- 2. STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const loading = isWriteLoading || isTxLoading;
  const minPaymentAmount = paymentToken.isNative
    ? parseUnits("0.000001", paymentToken.decimals)
    : parseUnits("0.0001", paymentToken.decimals);
  const lessThanMinPayment = amountA < minPaymentAmount;

  const now = new Date().getTime() / 1000;
  const startDate = allRulesets?.[0]?.start;
  const timeUntilStart = startDate ? startDate - now : 0;
  const hasStarted = timeUntilStart <= 0;
  const paymentsPaused = rulesetMetadata?.pausePay;

  // --- 3. DERIVED STATE & MEMOS ---
  const actionButtonContent = useMemo(() => {
    if (loading) return "Processing...";
    if (isApproving) return "Approving...";
    if (isSuccess) return "Success!";
    return "Agree & Buy";
  }, [loading, isSuccess]);

  function successToast() {
    const contributionAmount = formatUnits(amountA, paymentToken.decimals);
    toast({
      title: "Success",
      description: `Your contribution of ${truncateNumber(contributionAmount, true)} ${paymentToken.symbol} was successful.`,
    });
    setIsModalOpen(false);
    setAgreedToTerms(false);
  }

  function failureToast() {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Transaction unsuccessful.",
    });
  }

  const handlePay = async () => {
    if (!address || !selectedSucker || !publicClient) return;

    try {
      if (version === 4) {
        if (!primaryNativeTerminal?.data || !address || !selectedSucker) {
          return;
        }

        const txHash = await writeContractAsync({
          abi: jbMultiTerminalAbi,
          functionName: "pay",
          chainId: selectedSucker.peerChainId,
          address: primaryNativeTerminal?.data,
          args: [
            selectedSucker.projectId,
            NATIVE_TOKEN,
            amountA,
            address,
            0n,
            memo || "",
            "0x0",
          ],
          value: amountA,
        });

        const paymentStatus = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        if (paymentStatus.status === "success") {
          successToast();
        } else {
          failureToast();
        }
      } else {
        const terminal = await getPaymentTerminal({
          client: publicClient,
          version,
          chainId: targetChainId,
          projectId,
          token: paymentToken,
          baseToken,
        });

        if (!paymentToken.isNative) {
          await ensureAllowance(
            paymentToken.address,
            terminal.address,
            amountA
          );
        }

        const minTokens = paymentToken.isNative
          ? amountB
          : (amountB * 95n) / 100n;

        const txHash = await writeContractAsync({
          abi: terminal.abi,
          functionName: "pay",
          chainId: targetChainId,
          address: terminal.address,
          args: [
            projectId,
            paymentToken.address,
            amountA,
            address,
            minTokens,
            memo || "",
            "0x0",
          ],
          value: paymentToken.isNative ? amountA : 0n,
        });

        const paymentStatus = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        if (paymentStatus.status === "success") {
          successToast();
        } else {
          failureToast();
        }
      }
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  // --- 5. RENDER LOGIC ---
  if (
    (address && !OfacStatus?.isGoodAddress && !isOfacLoading)
    || (address && isOfacError)
  ) {
    return (
      <Button className={primaryButtonClasses} disabled>
        This Address is Blocked
      </Button>
    );
  }

  if (!hasStarted || paymentsPaused) {
    return (
      <Button className={primaryButtonClasses} disabled>
        {!hasStarted 
        ? "Payments Haven't Started Yet" 
        : "Payments Are Currently Paused"}
      </Button>
    );
  }

  // State 1: User is not connected
  if (!isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ isConnecting, show }) => (
          <Button
            onClick={show}
            loading={isConnecting}
            className={primaryButtonClasses}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </ConnectKitButton.Custom>
    );
  }

  // State 2: User is connected however has entered an amount greater than their balance
  if (
    walletBalance &&
    amountA &&
    (walletBalance.get(paymentToken.address) ?? 0n) < amountA
  ) {
    return (
      <Button className={primaryButtonClasses} disabled={true}>
        Insufficient Funds
      </Button>
    );
  }

  // State 3: Contribution is less than min threshold
  if (amountA && lessThanMinPayment) {
    return (
      <Button className={primaryButtonClasses} disabled>
        Contribution Is Too Small
      </Button>
    );
  }

  // State 4: User is connected and on the correct chain. Show the 'Buy' button.
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <ButtonWithWallet
          targetChainId={targetChainId}
          disabled={disabled}
          loading={showLoading}
          className={`shimmer-dark ${primaryButtonClasses}`}
        >
          Buy
        </ButtonWithWallet>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Before you continue...</DialogTitle>
        <DialogDescription>
          Please review and agree to the project's terms before proceeding.
        </DialogDescription>

        <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
          {metadata.data?.payDisclosure ? (
            <p className="font-semibold whitespace-pre-wrap">
              {metadata.data.payDisclosure}
            </p>
          ) : null}
        </div>
        <div className="mt-4 flex items-center space-x-3">
          <Checkbox.Root
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
            className="peer data-[state=checked]:bg-cerulean h-4 w-4 shrink-0 rounded-xs border border-slate-400 ring-offset-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
          >
            <Checkbox.Indicator className="flex items-center justify-center text-current">
              <Check className="h-4 w-4" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label
            htmlFor="terms"
            className="cursor-pointer text-sm leading-none font-medium font-semibold select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and agree to the terms.
          </label>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <DialogClose />
          <ButtonWithWallet
            targetChainId={targetChainId}
            disabled={!agreedToTerms || loading}
            loading={loading}
            onClick={handlePay}
            className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {actionButtonContent}
          </ButtonWithWallet>
        </div>
      </DialogContent>
    </Dialog>
  );
}
