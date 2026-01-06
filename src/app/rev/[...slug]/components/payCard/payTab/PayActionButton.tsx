"use client";
import { useToast } from "@/components/ui/use-toast";
import {
  JB_CHAINS,
  JBChainId,
  jbMultiTerminalAbi,
  NATIVE_TOKEN,
  TokenAmountType,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
} from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { formatUnits } from "viem";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { useSelectedSucker } from "../SelectedSuckerContext";
import { useAllowance } from "@/hooks/PaymentTerminal/useAllowance";
import { getPaymentTerminal } from "@/lib/paymentTerminal";
import { formatWalletError } from "@/lib/utils";
import { Token } from "@/lib/token";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useRulesetData } from "@/hooks/useRulesetData";

const shimmerClasses = `
    relative overflow-hidden 
    before:content-[''] before:absolute before:inset-0 
    before:-translate-x-full before:animate-shimmer 
    before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent
  `;

// Define shared styles for the main action button for consistency
const primaryButtonClasses =
  "w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:opacity-50";

/**
 * A self-contained button that handles wallet connection, chain switching,
 * and then opens a Radix UI confirmation dialog before the transaction.
 */

export function PayActionButton({
  amountA,
  amountB,
  paymentToken,
  walletBalance,
  memo,
  disabled,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  paymentToken: Token;
  walletBalance: Map<string, bigint>;
  memo: string | undefined;
  disabled?: boolean;
}) {
  // --- 1. HOOKS ---
  const project = useRevnetDataStore((state) => state.project);
  const { metadata } = useJBProjectMetadataContext();
  const { allRulesets } = useRulesetData({
    projectId: project.projectId,
  });
  const { selectedSucker } = useSelectedSucker();
  const {
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const { peerChainId: chainId, projectId } = selectedSucker;

  const { address, isConnected } = useAccount();
  const userChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { ensureAllowance, isApproving } = useAllowance(chainId);

  const { toast } = useToast();
  const baseToken = useProjectBaseToken();

  const targetChainId = selectedSucker?.peerChainId as JBChainId | undefined;
  const value = amountA.amount.value;

  const now = new Date().getTime() / 1000;
  const startDate = allRulesets?.[0]?.start;
  const timeUntilStart = startDate ? startDate - now : 0;
  const hasStarted = timeUntilStart <= 0;

  const {
    data: txHash,
    isPending: isWriteLoading,
    isError: isWriteError,
    writeContractAsync,
  } = useWriteContract();

  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const publicClient = usePublicClient();

  // --- 2. STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const loading = isWriteLoading || isTxLoading;

  // --- 3. DERIVED STATE & MEMOS ---
  const onCorrectChain = userChainId === targetChainId;
  const targetChainName = targetChainId
    ? JB_CHAINS[targetChainId]?.name
    : "the correct network";

  const actionButtonContent = useMemo(() => {
    if (loading) return "Processing...";
    if (isApproving) return "Approving...";
    if (isSuccess) return "Success!";
    return "Agree & Buy";
  }, [loading, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: `Your contribution of ${amountA.amount.format(4)} ${amountA.symbol} was successful.`,
      });
      setIsModalOpen(false);
      setAgreedToTerms(false);
    }
    if (isTxError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Transaction unsuccessful.",
      });
    }
  }, [isSuccess, isTxError]);

  const handlePay = async () => {
    if (!address || !selectedSucker || !publicClient) return;

    try {
      if (version === 4) {
        if (!primaryNativeTerminal?.data || !address || !selectedSucker) {
          return;
        }

        await writeContractAsync?.({
          abi: jbMultiTerminalAbi,
          functionName: "pay",
          chainId: selectedSucker.peerChainId,
          address: primaryNativeTerminal?.data,
          args: [
            selectedSucker.projectId,
            NATIVE_TOKEN,
            value,
            address,
            0n,
            memo || "",
            "0x0",
          ],
          value,
        });
      } else {
        const terminal = await getPaymentTerminal({
          client: publicClient,
          version,
          chainId,
          projectId,
          token: paymentToken,
          baseToken,
        });

        if (!paymentToken.isNative) {
          await ensureAllowance(paymentToken.address, terminal.address, value);
        }

        const minTokens = paymentToken.isNative
          ? 0n
          : (amountB.amount.value * 95n) / 100n;

        await writeContractAsync?.({
          abi: terminal.abi,
          functionName: "pay",
          chainId,
          address: terminal.address,
          args: [
            projectId,
            paymentToken.address,
            value,
            address,
            minTokens,
            memo || "",
            "0x0",
          ],
          value: paymentToken.isNative ? value : 0n,
        });
      }
    } catch (err) {
      console.error("Payment failed:", err);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: formatWalletError(err),
      });
    }
  };

  // --- 5. RENDER LOGIC ---
  if (!hasStarted) {
    return (
      <Button
        className={`${primaryButtonClasses} hover:bg-cerulean cursor-not-allowed opacity-50 hover:text-white`}
      >
        Payments Haven't Started Yet
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
            className={twMerge(primaryButtonClasses)}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </ConnectKitButton.Custom>
    );
  }

  // State 2: User is connected, but on the wrong chain
  if (targetChainId && !onCorrectChain) {
    return (
      <Button
        onClick={() => switchChain({ chainId: targetChainId })}
        loading={isSwitchingChain}
        className={twMerge(primaryButtonClasses)}
      >
        {isSwitchingChain ? "Switching..." : `Switch to ${targetChainName}`}
      </Button>
    );
  }

  // State 3: User is connected however has inputted an amount greater than their balance
  if (
    walletBalance &&
    amountA.amount._value &&
    Number(
      formatUnits(
        walletBalance.get(paymentToken.address) ?? 0n,
        paymentToken.decimals
      )
    ) < Number(formatUnits(amountA.amount._value, amountA.amount.decimals))
  ) {
    return (
      <Button className={twMerge(primaryButtonClasses)} disabled={true}>
        Insufficient Funds
      </Button>
    );
  }

  // State 4: User is connected and on the correct chain. Show the 'Buy' button.
  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        <Button
          disabled={!onCorrectChain || disabled}
          className={twMerge(primaryButtonClasses, shimmerClasses)}
        >
          Buy
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content
          //className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          className="bg-grey-450 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold">
            Before you continue...
          </Dialog.Title>
          <Dialog.Description className="text-muted-foreground mt-2 text-sm">
            Please review and agree to the project's terms before proceeding.
          </Dialog.Description>

          <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
            {metadata.data?.payDisclosure ? (
              <>
                <p className="font-semibold whitespace-pre-wrap">
                  {metadata.data.payDisclosure}
                </p>
              </>
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
            <Dialog.Close asChild>
              <Button className="background-color hover:background-color rounded-md">
                Cancel
              </Button>
            </Dialog.Close>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
