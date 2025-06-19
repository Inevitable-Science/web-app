import { useToast } from "@/components/ui/use-toast";
import { JB_CHAINS, NATIVE_TOKEN, TokenAmountType } from "juice-sdk-core";
import {
  useJBContractContext,
  useWriteJbMultiTerminalPay,
} from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { SuckerPair } from "juice-sdk-core";
import { JBChainId } from "juice-sdk-react";
import { Check, Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useNetworkData } from "@/app/[...slug]/components/NetworkDashboard/NetworkDataContext";
import { Button } from "./ui/button"; // Using your shadcn/ui Button
import { ConnectKitButton } from "connectkit";

const shimmerClasses = `
    relative overflow-hidden 
    before:content-[''] before:absolute before:inset-0 
    before:-translate-x-full before:animate-[shimmer_2s_infinite] 
    before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
  `;

// Define shared styles for the main action button for consistency
const primaryButtonClasses =
  "w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50";

/**
 * A self-contained button that handles wallet connection, chain switching,
 * and then opens a Radix UI confirmation dialog before the transaction.
 */
export function PayActionButton({
  amountA,
  amountB,
  memo,
  disabled,
  selectedSucker,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
  disabled?: boolean;
  selectedSucker?: SuckerPair | undefined;
}) {
  // --- 1. HOOKS ---
  const { contracts: { primaryNativeTerminal } } = useJBContractContext();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { metadata } = useNetworkData();
  const userChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const targetChainId = selectedSucker?.peerChainId as JBChainId | undefined;

  //
  // *** THIS IS THE CORRECTED SECTION ***
  // Restored the destructuring to include `writeContract` and `isWriteError`
  //
  const {
    data: txHash,
    isPending: isWriteLoading,
    isError: isWriteError,
    error: writeError,
    writeContract,
  } = useWriteJbMultiTerminalPay();

  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // --- 2. STATE ---
  const loading = isWriteLoading || isTxLoading;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // --- 3. DERIVED STATE & MEMOS ---
  const onCorrectChain = userChainId === targetChainId;
  const targetChainName = targetChainId ? JB_CHAINS[targetChainId]?.name : 'the correct network';

  const actionButtonContent = useMemo(() => {
    if (loading) return "Processing...";
    if (isSuccess) return "Success!";
    return "Agree & Buy";
  }, [loading, isSuccess]);

  /* // --- 4. EFFECTS & HANDLERS ---
  @TODO: toast is going brazy
  useEffect(() => {
    if (isSuccess) {
      toast({ title: "Success!", description: `Your contribution of ${amountA.amount.format(4)} ${amountA.symbol} was successful.` });
      setIsModalOpen(false);
      setAgreedToTerms(false);
    }
    // This now works correctly because isWriteError is destructured
    if (isTxError || isWriteError) {
      toast({ variant: "destructive", title: "Error", description: writeError?.name || "Transaction failed." });
    }
  }, [isSuccess, isTxError, isWriteError, writeError, toast, amountA]); */

  // This now works correctly because `writeContract` is defined
  const handlePay = () => {
    if (!primaryNativeTerminal?.data || !address || !selectedSucker || !writeContract) return;
    const value = amountA.amount.value;
    writeContract({
      chainId: selectedSucker.peerChainId,
      address: primaryNativeTerminal.data,
      args: [selectedSucker.projectId, NATIVE_TOKEN, value, address, 0n, memo || "", "0x0"],
      value,
    });
  };

  // --- 5. RENDER LOGIC ---

  // State 1: User is not connected
  if (!isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ isConnecting, show }) => (
          <Button
            onClick={show}
            loading={isConnecting}
            className={twMerge(primaryButtonClasses, shimmerClasses)}
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
        className={twMerge(primaryButtonClasses, shimmerClasses)}
      >
        {isSwitchingChain ? 'Switching...' : `Switch to ${targetChainName}`}
      </Button>
    );
  }

  // State 3: User is connected and on the correct chain. Show the 'Buy' button.
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Before you continue...
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Please review and agree to the project's terms before proceeding.
          </Dialog.Description>
          
          <div className="my-4 max-h-48 overflow-y-auto rounded-lg border bg-gray-50 p-4 text-xs">
            {metadata.data?.payDisclosure ? (
              <>
              <p className="whitespace-pre-wrap font-semibold text-gray-900">{metadata.data.payDisclosure}</p>
              </>
            ) : (
              <p className="text-gray-700">You acknowledge that all transactions on the blockchain are final and irreversible. You are responsible for the security of your own wallet and confirming the validity of your transaction. This platform provides tools to interact with decentralized protocols, but does not guarantee outcomes or provide investment advice.</p>
            )}
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <Checkbox.Root
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
              className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-400 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:bg-cerulean data-[state=checked]:text-white"
            >
              <Checkbox.Indicator className="flex items-center justify-center text-current"><Check className="h-4 w-4" /></Checkbox.Indicator>
            </Checkbox.Root>
            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-semibold text-gray-900">
              I have read and agree to the terms.
            </label>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Dialog.Close asChild>
              <Button className="rounded-md">Cancel</Button>
            </Dialog.Close>
            <ButtonWithWallet
              targetChainId={targetChainId}
              disabled={!agreedToTerms || loading}
              loading={loading}
              onClick={handlePay}
              className="inline-flex items-center justify-center rounded-md bg-cerulean px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-slate-300 disabled:text-slate-500"
            >
              {actionButtonContent}
            </ButtonWithWallet>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}