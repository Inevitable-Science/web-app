import { useToast } from "@/components/ui/use-toast";
import {
  JB_CHAINS,
  JBChainId,
  jbMultiTerminalAbi,
  SuckerPair,
  NATIVE_TOKEN,
  TokenAmountType,
} from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useBendystrawQuery,
} from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Check, Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { formatUnits } from "viem";
import { useIVXContext } from "../../DataProvider";
import { ProjectDocument, SuckerGroupDocument } from "@/generated/graphql";

const shimmerClasses = `
  relative overflow-hidden
  before:content-[''] before:absolute before:inset-0
  before:-translate-x-full before:animate-[shimmer_2s_infinite]
  before:bg-gradient-to-r before:from-transparent before:via-black/20 before:to-transparent
`;

// Define shared styles for the main action button for consistency
const primaryButtonClasses =
  "w-full rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-primary focus:outline-none disabled:opacity-50";

const memo = "";

// TODO:REVIEW

/**
 * A self-contained button that handles wallet connection, chain switching,
 * and then opens a Radix UI confirmation dialog before the transaction.
 */
export function PayActionButton({
  amountA,
  amountB,
  paymentToken,
  walletBalance,
  disabled,
  selectedSucker,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  paymentToken: `0x${string}`;
  walletBalance: number | string;
  disabled?: boolean;
  selectedSucker?: SuckerPair | undefined;
}) {
  // --- 1. HOOKS ---
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { metadata } = useIVXContext();
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
  } = useWriteContract();

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
  const targetChainName = targetChainId
    ? JB_CHAINS[targetChainId]?.name
    : "the correct network";

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

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: `Your contribution of ${amountA.amount.format(4)} ${amountA.symbol} was successful.`,
      });
      setIsModalOpen(false);
      setAgreedToTerms(false);
    }
    if (isTxError || isWriteError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Transaction unsuccessful.",
      });
    }
  }, [isSuccess, isTxError, isWriteError]);

  const { data: projectData } = useBendystrawQuery(
    ProjectDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version: Number(version), // TODO dynamic version
    },
    {
      enabled: !!chainId && !!projectId,
    }
  );
  const suckerGroupId = projectData?.project?.suckerGroupId;

  // Get all projects in the sucker group with their token data
  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: suckerGroupId ?? "" },
    { enabled: !!suckerGroupId }
  );

  const getTokenForChain = (targetChainId: number) => {
    if (!suckerGroupData?.suckerGroup?.projects?.items) {
      return paymentToken; // fallback to original paymentToken
    }

    const projectForChain = suckerGroupData.suckerGroup.projects.items.find(
      (project) => project.chainId === targetChainId
    );

    if (projectForChain?.token) {
      return projectForChain.token as `0x${string}`;
    }

    return paymentToken; // fallback to original paymentToken
  };

  const handlePay = () => {
    const value = amountA.amount.value;

    if (
      !primaryNativeTerminal?.data ||
      !address ||
      !selectedSucker ||
      !value ||
      !writeContract
    )
      return;

    const chainToken = getTokenForChain(selectedSucker.peerChainId);
    const isNative = chainToken === NATIVE_TOKEN.toLowerCase();

    /*writeContract({
      chainId: selectedSucker.peerChainId,
      address: primaryNativeTerminal.data,
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
    });*/
    writeContract?.({
      // TODO:REVIEW
      abi: jbMultiTerminalAbi,
      functionName: "pay",
      chainId: selectedSucker.peerChainId,
      address: primaryNativeTerminal.data as `0x${string}`,
      args: [
        selectedSucker.projectId,
        chainToken,
        value,
        address,
        0n,
        memo || "",
        "0x0",
      ],
      value: isNative ? value : 0n,
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
            className={primaryButtonClasses}
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
        className={primaryButtonClasses}
      >
        {isSwitchingChain ? "Switching..." : `Switch to ${targetChainName}`}
      </Button>
    );
  }

  // State 3: User is connected however has inputted an amount greater than their balance
  if (
    walletBalance &&
    amountA.amount._value &&
    Number(walletBalance) <
      Number(formatUnits(amountA.amount._value, amountA.amount.decimals))
  ) {
    return (
      <Button className={primaryButtonClasses} disabled={true}>
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

        <Dialog.Content
          //className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold">
            Before you continue...
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Please review and agree to the project's terms before proceeding.
          </Dialog.Description>

          <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
            {metadata.data?.payDisclosure ? (
              <>
                <p className="whitespace-pre-wrap font-semibold">
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
              className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-400 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:bg-cerulean data-[state=checked]:text-white"
            >
              <Checkbox.Indicator className="flex items-center justify-center text-current">
                <Check className="h-4 w-4" />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <label
              htmlFor="terms"
              className="cursor-pointer select-none text-sm font-medium font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              className="inline-flex items-center justify-center rounded-md !bg-cerulean px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:!bg-gunmetal disabled:text-grey-100"
            >
              {actionButtonContent}
            </ButtonWithWallet>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
