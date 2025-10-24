import { useToast } from "@/components/ui/use-toast";
import {
  JB_CHAINS,
  JBChainId,
  jbMultiTerminalAbi,
  SuckerPair,
  NATIVE_TOKEN,
  TokenAmountType,
  JBCoreContracts,
  jbDirectoryAbi,
  jbSwapTerminalAbi,
  JBSwapTerminalContracts,
} from "juice-sdk-core";
import {
  useJBContractContext,
} from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { erc20Abi, formatUnits, getContract } from "viem";
import { useIVXContext } from "../../DataProvider";
import { formatWalletError } from "@/lib/utils";
import { Token } from "@/lib/token";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import { getPaymentTerminal } from "@/lib/paymentTerminal";
import { useSelectedSucker } from "../../SelectedSuckerContext";

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
  //selectedSucker,
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  paymentToken: Token;
  walletBalance:  Map<string, bigint>;
  disabled?: boolean;
  //selectedSucker?: SuckerPair | undefined;
}) {
  // --- 1. HOOKS ---
  const {
    /*projectId,*/ version,
    contracts: { primaryNativeTerminal },
    contractAddress
  } = useJBContractContext();
  const { data: accountingContext } = useProjectAccountingContext();
  const { metadata } = useIVXContext();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { peerChainId: chainId, projectId } = selectedSucker;
  
  const { address, isConnected } = useAccount();
  const userChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  const { toast } = useToast();
  

  const isAcceptedTokenNative = accountingContext?.project?.token?.toLowerCase() === NATIVE_TOKEN.toLowerCase();
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
    writeContractAsync,
  } = useWriteContract();

  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // --- 2. STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const loading = isWriteLoading || isTxLoading || isApproving;

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
      setIsApproving(false);
    }
    if (isTxError || isWriteError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Transaction unsuccessful.",
      });
    }
  }, [isSuccess, isTxError, isWriteError]);



  /*const handlePay = async () => {

    // Prompt user to pay:
    // - If the fetched terminal equals primaryNativeTerminal:
    //     = Use the MultiTerminal ABI and write the contract.
    //     = Check if the payment token is native or if approval is required.
    // - If the terminal does NOT equal primaryNativeTerminal:
    //     = Use the swap terminal instead.

    const value = amountA.amount.value;

    if (
      !primaryNativeTerminal?.data ||
      !address ||
      !selectedSucker ||
      !value ||
      !publicClient ||
      !walletClient ||
      !writeContract
    ) return;

    try{
      const minTokens = paymentToken.isNative ? 0n : (amountB.amount.value * 95n) / 100n;

      const directory = getContract({
        address: contractAddress(JBCoreContracts.JBDirectory, selectedSucker.peerChainId),
        abi: jbDirectoryAbi,
        client: publicClient,
      });


      const terminal = await directory.read.primaryTerminalOf([selectedSucker.projectId, paymentToken.address]);

      if (!terminal) throw new Error(`No terminal found for ${paymentToken.symbol}`);
      
      if (terminal.toLowerCase() !== primaryNativeTerminal.data.toLowerCase()) { // When SwapTerminal is used
        console.log("using no terminal found, assuming swap terminal");
        
        const swapTerminalAddress = isAcceptedTokenNative ?
          contractAddress(JBSwapTerminalContracts.JBSwapTerminalRegistry, selectedSucker.peerChainId) :
          contractAddress(JBSwapTerminalContracts.JBSwapTerminalUSDCRegistry, selectedSucker.peerChainId);
        
        
        if (!paymentToken.isNative) {
          const allowance = await publicClient.readContract({
            address: paymentToken.address,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, swapTerminalAddress],
          });

          if (BigInt(allowance) < BigInt(value)) {
            setIsApproving(true);
            const hash = await walletClient.writeContract({
              address: paymentToken.address,
              abi: erc20Abi,
              functionName: "approve",
              args: [swapTerminalAddress, value],
            });
            console.log("allowance is less than value, requesting approval");
            await publicClient.waitForTransactionReceipt({ hash });
            setIsApproving(false);
          }
        }

        writeContract?.({
          abi: jbSwapTerminalAbi,
          functionName: "pay",
          chainId: selectedSucker.peerChainId,
          address: swapTerminalAddress,
          args: [
            selectedSucker.projectId,
            paymentToken.address,
            value,
            address,
            minTokens,
            memo || "",
            "0x0",
          ],
          value: paymentToken.isNative ? value : 0n,
        });

      } else {  // When MultiTerminal is used
        console.log("terminal found");

        if (!paymentToken.isNative) {
          const allowance = await publicClient.readContract({
            address: paymentToken.address,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, terminal],
          });

          if (BigInt(allowance) < BigInt(value)) {
            setIsApproving(true);
            const hash = await walletClient.writeContract({
              address: paymentToken.address,
              abi: erc20Abi,
              functionName: "approve",
              args: [terminal, value],
            });
            console.log("allowance is less than value, requesting approval");
            await publicClient.waitForTransactionReceipt({ hash });
            setIsApproving(false);
          }
        }

        writeContract?.({
          abi: jbMultiTerminalAbi,
          functionName: "pay",
          chainId: selectedSucker.peerChainId,
          address: terminal,
          args: [
            selectedSucker.projectId,
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
      setIsApproving(false);
      console.error("Payment failed:", err);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: formatWalletError(err),
      });
    }
  };*/



  const handlePay = async () => {
    if (!address || !selectedSucker || !walletClient || !publicClient) return;
    const value = amountA.amount.value;

    try {
      const terminal = await getPaymentTerminal({
        client: publicClient,
        version,
        chainId: selectedSucker.peerChainId,
        projectId,
        token: paymentToken,
      });

      if (!paymentToken.isNative) {
        const allowance = await publicClient.readContract({
          address: paymentToken.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, terminal.address],
        });

        if (BigInt(allowance) < BigInt(value)) {
          setIsApproving(true);
          const hash = await walletClient.writeContract({
            address: paymentToken.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [terminal.address, value],
          });
          await publicClient.waitForTransactionReceipt({ hash });
          setIsApproving(false);
        }
      }

      const minTokens = paymentToken.isNative ? 0n : (amountB.amount.value * 95n) / 100n;

      await writeContractAsync?.({
        abi: terminal.abi,
        functionName: "pay",
        chainId,
        address: terminal.address,
        args: [projectId, paymentToken.address, value, address, minTokens, memo || "", "0x0"],
        value: paymentToken.isNative ? value : 0n,
      });
    } catch (err) {
      setIsApproving(false);
      console.error("Payment failed:", err);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: formatWalletError(err),
      });
    }
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
        {isSwitchingChain === false && `Switch to ${targetChainName}`}
      </Button>
    );
  }

  // State 3: User is connected however has inputted an amount greater than their balance
  if (
    walletBalance &&
    amountA.amount._value &&
    Number(formatUnits(walletBalance.get(paymentToken.address) ?? 0n, paymentToken.decimals)) <
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
              //onClick={handlePay}
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
