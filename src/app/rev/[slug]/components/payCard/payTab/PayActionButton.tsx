"use client";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAllowance } from "@/hooks/PaymentTerminal/useAllowance";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { getPaymentTerminal } from "@/lib/paymentTerminal";
import { Token } from "@/lib/token";
import { formatNumber } from "@/lib/utils";
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
  JB_TOKEN_DECIMALS,
  jbMultiTerminalAbi,
  NATIVE_TOKEN,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { PayStepper } from "./PayStepper";

const shimmerClasses = `
  relative overflow-hidden 
  before:content-[''] before:absolute before:inset-0 
  before:-translate-x-full before:animate-shimmer 
  before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent
`;

// Define shared styles for the main action button for consistency
const primaryButtonClasses =
  "w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:opacity-50";

export type PaymentStatusType =
  | ""
  | "signing-approval"
  | "rejected-approval"
  | "signing-pay"
  | "rejected-pay"
  | "success";

export function PayActionButton({
  amountA,
  amountB,
  paymentToken,
  walletBalance,
  memo,
  hasStarted,
  disabled,
}: {
  amountA: bigint;
  amountB: bigint;
  paymentToken: Token;
  walletBalance: Map<string, bigint>;
  memo: string | undefined;
  hasStarted: boolean;
  disabled?: boolean;
}) {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const { peerChainId: activeChainId, projectId: activeProjectId } = selectedSucker;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [pending, setPending] = useState(false);
  const [currentStep, setCurrentStep] = useState<PaymentStatusType>("");
  const [userHasApproved, setUserHasApproved] = useState(false);
  const [dialogStage, setDialogStage] = useState<"terms" | "tx">("terms");

  const { metadata } = useJBProjectMetadataContext();
  const { token } = useJBTokenContext();
  const {
    version,
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const baseToken = useProjectBaseToken();
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { ensureAllowance, isApproving } = useAllowance(activeChainId);
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const amountANum = formatUnits(amountA, paymentToken.decimals);
  const amountBNum = formatUnits(amountB, projectTokenDecimals);
  const insufficientFunds = (walletBalance.get(paymentToken.address) ?? 0n) < amountA;
  
  const minPaymentAmount = paymentToken.isNative ? 
    parseUnits('0.000001', paymentToken.decimals) :
    parseUnits('0.0001', paymentToken.decimals);
  const lessThanMinPayment = amountA < minPaymentAmount;

  // --- 3. DERIVED STATE & MEMOS ---
  const actionButtonContent = 
    pending ? 
      "Processing..." :
    isApproving ?
      "Approving..." :
    currentStep === "success" ?
      "Success" :
    "Agree & Buy";

  useEffect(() => {
    if (isApproving) {
      setCurrentStep("signing-approval");
    }
  }, [isApproving]);

  // Side effect that resets modal state on token change
  useEffect(() => {
    if (!paymentToken.isNative) {
      setCurrentStep("");
      setUserHasApproved(false);
    }
  }, [paymentToken]);

  const handlePay = async () => {
    try {
      if (!address || !selectedSucker || !publicClient) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Required data was ",
        });
        return;
      };

      setPending(true);

      if (version === 4) {
        if (!primaryNativeTerminal?.data) throw new Error();

        const txHash = await writeContractAsync({
          abi: jbMultiTerminalAbi,
          functionName: "pay",
          chainId: activeChainId,
          address: primaryNativeTerminal?.data,
          args: [
            activeProjectId,
            NATIVE_TOKEN, // assume native token for v4 projects
            amountA,
            address,
            amountB,
            memo || "",
            "0x0",
          ],
          value: amountA,
        });

        const result = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (result.status !== "success") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Transaction unsuccessful.",
          });
        };

        toast({
          title: "Success",
          description: `Your contribution of ${formatNumber(amountANum, false)} ${paymentToken.symbol} was successful.`,
        });
        setAgreedToTerms(false);

      } else {
        const terminal = await getPaymentTerminal({
          client: publicClient,
          version,
          chainId: activeChainId,
          projectId: activeProjectId,
          token: paymentToken,
          baseToken,
        });

        if (!paymentToken.isNative) {
          try {
            await ensureAllowance(
              paymentToken.address,
              terminal.address,
              amountA
            );
            setUserHasApproved(true);
            setCurrentStep("");
          } catch (err) {
            console.error(err);
            setCurrentStep("rejected-approval");
            return;
          }
        }

        const minTokens = paymentToken.isNative
          ? amountB
          : (amountB * 95n) / 100n;

        setCurrentStep("signing-pay");

        const txHash = await writeContractAsync({
          abi: terminal.abi,
          functionName: "pay",
          chainId: activeChainId,
          address: terminal.address,
          args: [
            activeProjectId,
            paymentToken.address,
            amountA,
            address,
            minTokens,
            memo || "",
            "0x0",
          ],
          value: paymentToken.isNative ? amountA : 0n,
        });

        const result = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (result.status !== "success") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Transaction unsuccessful.",
          });
        };

        toast({
          title: "Success",
          description: `Your contribution of ${formatNumber(amountANum, false)} ${paymentToken.symbol} was successful.`,
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

  if (amountA && lessThanMinPayment) {
    return (
      <Button className={primaryButtonClasses} disabled>
        Contribution Is Too Small
      </Button>
    );
  }

  // State 2: User is connected however has inputted an amount greater than their balance
  if (
    walletBalance &&
    amountA &&
    insufficientFunds
  ) {
    return (
      <Button className={twMerge(primaryButtonClasses)} disabled>
        Insufficient Funds
      </Button>
    );
  }

  // State 3: User is connected and on the correct chain. Show the 'Buy' button.
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <ButtonWithWallet
          targetChainId={activeChainId}
          className={twMerge(primaryButtonClasses, shimmerClasses)}
          disabled={disabled || (!amountA && !amountB)}
        >
          Buy
        </ButtonWithWallet>
      </DialogTrigger>

      <DialogContent>
        {dialogStage === "terms" || paymentToken.isNative ? (
          <>
            <DialogTitle>
              Before you continue...
            </DialogTitle>
            <DialogDescription>
              {metadata.data?.payDisclosure
                ? "Please review and agree to the project's terms before proceeding."
                : "Please review the following."}
            </DialogDescription>

            {metadata.data?.payDisclosure ? (
              <>
                <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
                  <p className="font-semibold whitespace-pre-wrap">
                    {metadata.data.payDisclosure}
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
              </>
            ) : (
              <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-sm">
                <p>
                  Paying: {formatNumber(amountANum, false)} {paymentToken.symbol}
                </p>
                <p>
                  Receive: ~{formatNumber(amountBNum, false)} {token.data?.symbol ?? "TOKENS"}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              <DialogClose />

              {paymentToken.isNative ? (
                <ButtonWithWallet
                  targetChainId={activeChainId}
                  disabled={!!metadata.data?.payDisclosure && !agreedToTerms}
                  loading={pending}
                  onClick={handlePay}
                  className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {actionButtonContent}
                </ButtonWithWallet>
              ) : (
                <Button
                  onClick={() => setDialogStage("tx")}
                  className="bg-cerulean!"
                >
                  Confirm
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogTitle>
              Confirm Payment
            </DialogTitle>
            <DialogDescription>
              Sign the following transactions to open a new loan.
            </DialogDescription>

            <div>
              <PayStepper
                currentStep={currentStep}
                userHasApproved={userHasApproved}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <DialogClose />
              <ButtonWithWallet
                targetChainId={activeChainId}
                disabled={!!metadata.data?.payDisclosure && !agreedToTerms}
                loading={pending}
                onClick={handlePay}
                className="bg-cerulean! disabled:bg-gunmetal! disabled:text-grey-100 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {actionButtonContent}
              </ButtonWithWallet>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
