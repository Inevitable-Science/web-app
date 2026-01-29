import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { formatNumber, formatWalletError } from "@/lib/utils";
import { JB_TOKEN_DECIMALS, JBChainId, jbPermissionsAbi, NATIVE_TOKEN, revDeployerAbi, revLoansAbi, RevnetCoreContracts, SuckerPair, USDC_ADDRESSES } from "juice-sdk-core";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import * as Dialog from "@radix-ui/react-dialog";
import { LoanFeeChart } from "./LoanFeeChart";
import { generateFeeData } from "@/lib/feeHelpers";
import { LoanStepper } from "./LoanStepper";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

const shimmerClasses = `
  w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:opacity-50
  relative overflow-hidden 
  before:content-[''] before:absolute before:inset-0 
  before:-translate-x-full before:animate-shimmer 
  before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent
`;

export type BorrowStatus = 
  ""
  | "signing-permission" 
  | "rejected-permission" 
  | "signing-approval"
  | "rejected-approval"
  | "signing-borrow" 
  | "rejected-borrow"
  | "success";

export function LoanActionButton({
  loanAmount,
  collateralAmount,
  projectTokenBalance,
  revLoansContractAddress,
}: {
  loanAmount: bigint | undefined;
  collateralAmount: string;
  projectTokenBalance: bigint;
  revLoansContractAddress: Address;
}) {
  const selectedSucker = useRevnetDataStore(state => state.selectedSucker);
  const [prepaidPercent, setPrepaidPercent] = useState(2.5);

  const [borrowStatus, setBorrowStatus] = useState<BorrowStatus>("");
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [userHasBorrowPerm, setUserHasBorrowPerm] = useState(false);
  const [userHasApproved, setUserHasApproved] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogStage, setDialogStage] = useState<
    "acknowledgement" | "feeStructure" | "transactions"
  >("acknowledgement");

  // JB Hooks
  const { contracts: { primaryNativeTerminal }, contractAddress } = useJBContractContext();
  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();

  // Client Hooks
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  
  // Sucker Derived Values
  const activeChainId = selectedSucker.peerChainId;
  const activeProjectId = selectedSucker.projectId;
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const baseTokenAddress = (baseToken.isNative 
    ? NATIVE_TOKEN.toLowerCase() 
    : USDC_ADDRESSES[activeChainId]
  ) as Address;

  // Contract Calls
  const { data: revDeployerFee } = useReadContract({
    abi: revDeployerAbi,
    functionName: "FEE",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });

  const { data: resolvedPermissionsAddress } = useReadContract({
    abi: revDeployerAbi,
    functionName: "PERMISSIONS",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });

  const { data: revPrepaidFeePercent } = useReadContract({
    abi: revLoansAbi,
    functionName: "REV_PREPAID_FEE_PERCENT",
    address: revLoansContractAddress,
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });

  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId: activeProjectId,
    chainId: activeChainId,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });

  useEffect(() => {
    if (userHasPermission === userHasBorrowPerm) return;

    if (userHasPermission !== undefined) {
      setUserHasBorrowPerm(userHasPermission);
    };
  }, [userHasPermission]);

  const feeData = generateFeeData({
    grossBorrowedEth: loanAmount ? Number(formatUnits(loanAmount, baseToken.decimals)) : 0,
    prepaidPercent,
  });

  const totalFixedFees =
    (revDeployerFee ? Number(revDeployerFee) : 0) +
    (revPrepaidFeePercent ? Number(revPrepaidFeePercent) : 0);
  const loanAmountNum = loanAmount ? Number(formatUnits(loanAmount, baseToken.decimals)) : 0;
  const protocolFees = loanAmountNum * (totalFixedFees / 1000);
  const prepaidAmount = (prepaidPercent / 100) * loanAmountNum;
  const amountToWallet = loanAmountNum - protocolFees - prepaidAmount;
  
  const feeBasisPoints = Math.round(prepaidPercent * 10);
  const collateralBigInt = parseUnits(collateralAmount, projectTokenDecimals);

  const handleBorrow = async () => {
    try {
      if (
        !publicClient ||
        !primaryNativeTerminal?.data ||
        !address ||
        !resolvedPermissionsAddress
      ) {
        toast({
          variant: "destructive",
          title: "Client Error",
          description: "Couldn't start the borrow process, please refresh and try again.",
        });
        return;
      };

      setIsBorrowing(true);

      if (!userHasBorrowPerm) {
        setBorrowStatus("signing-permission");
        try {
          const txHash = await writeContractAsync({
            address: resolvedPermissionsAddress,
            abi: jbPermissionsAbi,
            functionName: "setPermissionsFor",
            args: [
              address,
              {
                operator: revLoansContractAddress,
                projectId: activeProjectId,
                permissionIds: [1],
              },
            ],
          });
          await publicClient.waitForTransactionReceipt({ hash: txHash });

          setBorrowStatus("");
          setUserHasBorrowPerm(true);

        } catch (err) {
          setBorrowStatus("rejected-permission");
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Permission was not granted. Please approve to proceed.",
          });
          return;
        }
      }

      // Check allowance for non-ETH base tokens (for standard borrow)
      /*if (!baseToken.isNative && loanAmount) {
        const allowance = await publicClient.readContract({
          address: baseTokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address as Address, revLoansContractAddress as Address],
        });

        if (BigInt(allowance) < loanAmount) {
          try {
            setBorrowStatus("signing-approval");

            const approveHash = await writeContractAsync({
              address: baseTokenAddress,
              abi: erc20Abi,
              functionName: "approve",
              args: [revLoansContractAddress as Address, loanAmount],
            });

            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            setBorrowStatus("");
            setUserHasApproved(true);

          } catch (err) {
            setBorrowStatus("rejected-approval");
            toast({
              variant: "destructive",
              title: "Approval Denied",
              description: "Approval was cancelled by user",
            });
            return;
          }
        } else {
          setUserHasApproved(true);
        }
      }*/
      try {
        setBorrowStatus("signing-borrow");
        await writeContractAsync({
          abi: revLoansAbi,
          functionName: "borrowFrom",
          address: revLoansContractAddress,
          chainId: Number(activeChainId) as JBChainId,
          args: [
            activeProjectId,
            {
              token: baseTokenAddress,
              terminal: primaryNativeTerminal.data,
            },
            0n,
            collateralBigInt,
            address as `0x${string}`,
            BigInt(feeBasisPoints),
          ],
        });

        setBorrowStatus("success");
        toast({
          variant: "destructive",
          title: "Loan Created",
          description: "Loan was successfully created",
        });
        return;

      } catch (err) {
        setBorrowStatus("rejected-borrow");
        toast({
          variant: "destructive",
          title: "Transaction Cancelled",
          description: "Loan creation was cancelled by user",
        });
        return;
      }
    } catch (err) {
      setBorrowStatus("rejected-borrow");
      toast({
        variant: "destructive",
        title: "Borrow Failed",
        description: formatWalletError(err),
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  if (projectTokenBalance < collateralBigInt) {
    return (
      <Button
        className={shimmerClasses}
        disabled
      >
        Insufficient Funds
      </Button>
    )
  }

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        <Button
          className={shimmerClasses}
          disabled={!collateralAmount}
        >
          Open Loan
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {dialogStage === "acknowledgement" && (
            <>
              <Dialog.Title className="text-lg font-semibold">
                Before you continue...
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-2 text-sm">
                Please note the following before proceeding.
              </Dialog.Description>

              <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
                <ul className="list-disc flex flex-col gap-0.5 pl-2">
                  <li>Your {formatNumber(collateralAmount, false)} ${token.data?.symbol} tokens will be burned as collateral</li>
                  <li>You will receive an NFT to reclaim them when repaying</li>
                  <li>After 10 years, loan is liquidated and collateral is lost</li>
                </ul>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Dialog.Close asChild>
                  <Button>
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button 
                  variant={"secondary"}
                  onClick={() => setDialogStage("feeStructure")}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {dialogStage === "feeStructure" && (
            <>
              <Dialog.Title className="text-lg font-semibold">
                Confirm Fee Structure
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-2 text-sm">
                Please confirm the fee structure of the loan.
              </Dialog.Description>

              <div className="background-color my-4 overflow-y-auto rounded-xl p-4 text-sm">
                <p>
                  Collateral Amount: {formatNumber(collateralAmount, false)} ${token.data?.symbol}
                </p>
                <p>
                  You Receive: {formatNumber(amountToWallet, false)} {baseToken.symbol}
                </p>
              </div>

              <div className="background-color my-4 overflow-y-auto rounded-xl px-4 py-2 text-xs">
                <LoanFeeChart
                  prepaidPercent={prepaidPercent}
                  setPrepaidPercent={setPrepaidPercent}
                  feeData={feeData}
                  grossBorrowedNative={loanAmount ? Number(formatUnits(loanAmount, baseToken.decimals)) : 0}
                  collateralAmount={collateralAmount}
                  tokenSymbol={baseToken.symbol}
                  collateralTokenSymbol={token.data?.symbol}
                  displayYears={1}
                  displayMonths={12}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Dialog.Close asChild>
                  <Button>
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button 
                  variant={"secondary"}
                  onClick={() => setDialogStage("transactions")}
                >
                  Confirm
                </Button>
              </div>
            </>
          )}

          {dialogStage === "transactions" && (
            <>
              <Dialog.Title className="text-lg font-semibold">
                Sign Transactions
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-2 text-sm">
                Sign the following transactions to open a new loan.
              </Dialog.Description>

              <div className="background-color my-4 overflow-y-auto rounded-xl p-4 text-sm">
                <p>
                  Collateral Amount: {formatNumber(collateralAmount, false)} ${token.data?.symbol}
                </p>
                <p>
                  Prepaid Percent: {prepaidPercent}%
                </p>
                <p>
                  You Receive: {formatNumber(amountToWallet, false)} {baseToken.symbol}
                </p>
              </div>

              <LoanStepper 
                currentStep={borrowStatus}
                userHasApproved={userHasApproved}
                userHasPermission={userHasPermission ?? false}
                baseTokenIsNative={baseToken.isNative}
              />

              <div className="mt-6 flex justify-end space-x-2">
                <Dialog.Close asChild>
                  <Button>
                    Cancel
                  </Button>
                </Dialog.Close>
                <ButtonWithWallet
                  targetChainId={activeChainId}
                  onClick={handleBorrow}
                  className={"bg-cerulean hover:bg-cerulean"}
                  loading={isBorrowing}
                  disabled={!collateralAmount}
                >
                  Open Loan
                </ButtonWithWallet>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
