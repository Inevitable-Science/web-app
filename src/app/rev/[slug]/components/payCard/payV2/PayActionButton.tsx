"use client";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAllowance } from "@/hooks/PaymentTerminal/useAllowance";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { formatNumber, truncateNumber } from "@/lib/utils";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import * as Checkbox from "@radix-ui/react-checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConnectKitButton } from "connectkit";
import {
  getJBContractAddress,
  JB_CHAINS,
  JB_TOKEN_DECIMALS,
  JBCoreContracts,
  jbDirectoryAbi,
  jbMultiTerminalAbi,
  JBRouterTerminalContracts,
  jbRouterTerminalRegistryAbi,
  NATIVE_TOKEN,
} from "@bananapus/nana-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import { Check, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { PayStepper } from "./PayStepper";
import {
  selectHasStarted,
  useTransactionCardStore,
} from "../TransactionCardStore";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import EtherscanLink from "@/components/EtherscanLink";

// Define shared styles for the main action button for consistency
export const primaryPayButtonClass =
  "w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-cerulean/80 focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:opacity-50";

export function PayActionButton({
  walletBalance,
  disabled,
}: {
  walletBalance: Map<string, bigint>;
  disabled?: boolean;
}) {
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);     
  const { peerChainId: activeChainId, projectId: activeProjectId } = useRevnetDataStore((state) => state.selectedSucker); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // TransactionCard only renders the pay tab once a token is selected
  const paymentToken = useTransactionCardStore((state) => state.selectedToken)!;
  const payAmount = useTransactionCardStore((state) => state.payAmount);
  const receiveAmountBigInt = useTransactionCardStore((state) => state.receiveAmountBigInt);
  const memo = useTransactionCardStore((state) => state.memo);
  const hasStarted = useTransactionCardStore(selectHasStarted);

  const pending = useTransactionCardStore((state) => state.isPaying);
  const setPending = useTransactionCardStore((state) => state.setIsPaying);
  const currentStep = useTransactionCardStore((state) => state.paymentStatus);
  const setCurrentStep = useTransactionCardStore(
    (state) => state.setPaymentStatus
  );
  const setUserHasApproved = useTransactionCardStore(
    (state) => state.setUserHasApproved
  );
  const resetPayTransaction = useTransactionCardStore(
    (state) => state.resetPayTransaction
  );

  const payAmountBigInt = parseUnits(payAmount, paymentToken.decimals);
  // terms (only if disclosure) -> review -> sign (non-native only, shows PayStepper)
  const [dialogStage, setDialogStage] = useState<"terms" | "review" | "sign">("terms");
  const [paymentTxHash, setPaymentTxHash] = useState<null | string>(null);

  const { metadata } = useJBProjectMetadataContext();
  const { token } = useJBTokenContext();
  const {
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();  

  const baseToken = useProjectBaseToken();
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;
  const paymentsPaused = rulesetMetadata?.pausePay;

  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { ensureAllowance, isApproving } = useAllowance(activeChainId);
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();


  const amountBNum = formatUnits(receiveAmountBigInt, projectTokenDecimals);
  const insufficientFunds =
    (walletBalance.get(paymentToken.address) ?? 0n) < payAmountBigInt;

  const minPaymentAmount = paymentToken.isNative
    ? parseUnits("0.000001", paymentToken.decimals)
    : parseUnits("0.0001", paymentToken.decimals);
  const lessThanMinPayment = payAmountBigInt < minPaymentAmount;


  const SLIPPAGE_BPS = 100n; // 1%
  const BPS_DENOMINATOR = 10_000n;

  const minReceiveAmountBigInt = (receiveAmountBigInt * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR;
  const minReceiveAmount = formatUnits(minReceiveAmountBigInt, JB_TOKEN_DECIMALS);

  // --- 3. DERIVED STATE & MEMOS ---
  const actionButtonContent = pending
    ? "Processing..."
    : isApproving
      ? "Approving..."
      : currentStep === "success"
        ? "Payment Successful"
        : "Pay";

  useEffect(() => {
    if (isApproving) {
      setCurrentStep("signing-approval");
    }
  }, [isApproving]);

  const handlePay = async () => {
    try {
      if (
        !address 
        || !activeChainId 
        || !activeProjectId 
        || !publicClient
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Required data was ",
        });
        return;
      }

      setPending(true);

      if (version === 6) {
        const jbDirectory = await publicClient.readContract({
          address: getJBContractAddress(JBCoreContracts.JBDirectory, 6, activeChainId),
          abi: jbDirectoryAbi,
          functionName: 'primaryTerminalOf',
          args: [activeProjectId, NATIVE_TOKEN],
        });

        console.log(jbDirectory, "jb dir");
        const contract = baseToken.isNative === paymentToken.isNative
          ? {
            address: getJBContractAddress(JBCoreContracts.JBMultiTerminal, 6, activeChainId),
            abi: jbMultiTerminalAbi
          } : {
            address: getJBContractAddress(JBRouterTerminalContracts.JBRouterTerminalRegistry, 6, activeChainId),
            abi: jbRouterTerminalRegistryAbi
          };

        if (!paymentToken.isNative) {
          try {
            await ensureAllowance(
              paymentToken.address,
              contract.address,
              payAmountBigInt
            );
            setUserHasApproved(true);
            setCurrentStep("");
          } catch (err) {
            console.error(err);
            setCurrentStep("rejected-approval");
            return;
          }
        };
        
        setCurrentStep('signing-pay');
         
        const txHash = await writeContractAsync({
          abi: contract.abi,
          functionName: "pay",
          chainId: activeChainId,
          address: contract.address,
          args: [
            activeProjectId,
            paymentToken.address,
            payAmountBigInt,
            address,
            minReceiveAmountBigInt,
            memo || "",
            "0x0",
          ],
          value: paymentToken.isNative ? payAmountBigInt : 0n,
        });

        const result = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        if (result.status !== "success") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Transaction unsuccessful.",
          });
        }

        setPaymentTxHash(txHash);
        setCurrentStep("success");
        toast({
          title: "Success",
          description: `Your contribution of ${formatNumber(payAmount, false)} ${paymentToken.symbol} was successful.`,
        });
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setCurrentStep("rejected-pay");
      return;
    } finally {
      setPending(false);
    }
  };

  // --- 5. RENDER LOGIC ---
  if (!hasStarted || paymentsPaused) {
    return (
      <Button className={primaryPayButtonClass} disabled>
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
            className={primaryPayButtonClass}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </ConnectKitButton.Custom>
    );
  }

  // State 2: Contribution is less than min threshold
  if (payAmount && lessThanMinPayment) {
    return (
      <Button className={primaryPayButtonClass} disabled>
        Contribution Is Too Small
      </Button>
    );
  }

  // State 3: User is connected however has inputted an amount greater than their balance
  if (walletBalance && payAmountBigInt && insufficientFunds) {
    return (
      <Button className={primaryPayButtonClass} disabled>
        Insufficient Funds
      </Button>
    );
  }

  const payDisclosure = metadata.data?.payDisclosure;
  const showDisclosureNotice =
    payDisclosure
    && dialogStage === "terms"
    && currentStep !== "success";
  const showReview =
    !showDisclosureNotice
    && dialogStage !== "sign"
    && currentStep !== "success";
  const showSign =
    dialogStage === "sign"
    && !paymentToken.isNative
    && currentStep !== "success";

  const handleOpenChange = (open: boolean) => {
    if (!open && pending) return; // don't close mid-signature
    setIsModalOpen(open);

    if (!open) {
      setDialogStage("terms");
      setAgreedToTerms(false);
      setPaymentTxHash(null);
      resetPayTransaction();
    }
  };

  // State 4: User is connected and on the correct chain. Show the 'Buy' button.
  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <ButtonWithWallet
          targetChainId={activeChainId}
          className={`shimmer ${primaryPayButtonClass}`}
          disabled={disabled || (!payAmountBigInt && !receiveAmountBigInt)}
        >
          Buy
        </ButtonWithWallet>
      </DialogTrigger>

      <DialogContent>
        {showDisclosureNotice && (
          <>
            <DialogTitle>Before you continue...</DialogTitle>
            <DialogDescription>
              Please review and agree to the project's terms before proceeding.
            </DialogDescription>
            <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
              <p className="font-semibold whitespace-pre-wrap">
                {payDisclosure}
              </p>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <Checkbox.Root
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(Boolean(checked))
                }
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
              <Button
                className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => {setDialogStage("review")}}
                disabled={!agreedToTerms}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {showReview && (
          <>
          <DialogTitle>Review Payment</DialogTitle>
          <DialogDescription>
            Please review the following before proceeding.
          </DialogDescription>
          <div className="my-4">
            <div className="background-color max-h-48 flex flex-col sm:flex-row sm:justify-between overflow-y-auto rounded-xl p-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  Paying
                </p>
                <p className="text-lg">
                  {truncateNumber(payAmount, false)}{" "}
                  {paymentToken.symbol}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground sm:text-right">
                  Receive
                </p>
                <p className="text-lg">
                  ~{truncateNumber(amountBNum, false)}{" "}
                  {token.data?.symbol ?? "TOKENS"}
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Minimum Recieved
                <br/>
                <span className="text-white">
                  {truncateNumber(minReceiveAmount, false)} {token.data?.symbol ?? "TOKENS"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground text-right sm:block hidden">
                Slippage Tolerance
                <br/>
                <span className="text-white">1%</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <DialogClose />
            {paymentToken.isNative ? (
              <ButtonWithWallet
                targetChainId={activeChainId}
                disabled={!!payDisclosure && !agreedToTerms}
                loading={pending}
                onClick={handlePay}
                className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {actionButtonContent}
              </ButtonWithWallet>
            ) : (
              <Button
                className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => setDialogStage("sign")}
                disabled={!!payDisclosure && !agreedToTerms}
              >
                Continue
              </Button>
            )}
          </div>
          </>
        )}

        {showSign && (
          <>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Sign the following transactions to pay the project.
            </DialogDescription>

            <PayStepper />

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setDialogStage("review")}
                disabled={pending}
              >
                Back
              </Button>
              <ButtonWithWallet
                targetChainId={activeChainId}
                disabled={!!payDisclosure && !agreedToTerms}
                loading={pending}
                onClick={handlePay}
                className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {actionButtonContent}
              </ButtonWithWallet>
            </div>
          </>
        )}

        {currentStep === "success" && (
          <>
            <div className="flex flex-col items-center text-center">
              <DialogTitle>Payment successful</DialogTitle>
              <DialogDescription className="mt-0">
                Your {token.data?.symbol ?? "tokens"} are on their way to your wallet.
              </DialogDescription>
            </div>

            <div className="my-4">
              <div className="background-color flex flex-col gap-3 rounded-xl p-4 text-sm sm:flex-row sm:justify-between">
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="text-lg">
                    {truncateNumber(payAmount, false)} {paymentToken.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground sm:text-right">Received</p>
                  <p className="text-lg sm:text-right">
                    ~{truncateNumber(amountBNum, false)} {token.data?.symbol ?? "TOKENS"}
                  </p>
                </div>
              </div>

              {paymentTxHash && (
                <div className="mt-1 flex flex-row items-center justify-between">
                  <p className="text-xs text-muted-foreground">Transaction</p>
                  <EtherscanLink
                    className="text-xs text-muted-foreground flex items-center gap-1"
                    value={paymentTxHash}
                    chain={JB_CHAINS[activeChainId].chain}
                    type="tx"
                  >
                    {paymentTxHash.slice(0, 6)}…{paymentTxHash.slice(-4)}
                    <ExternalLink className="h-3 w-3" />
                  </EtherscanLink>
                </div>
              )}
            </div>

            <DialogClose 
              className="!bg-cerulean w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Done
            </DialogClose>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
