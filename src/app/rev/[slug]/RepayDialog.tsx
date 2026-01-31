/*"use client"
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { Button } from "@/components/ui/button";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import * as Dialog from "@radix-ui/react-dialog";
import { JBChainId, useJBProjectMetadataContext } from "juice-sdk-react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


export function RepayDialog() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collateralToReturn, setCollateralToReturn] = useState("");

  const { metadata } = useJBProjectMetadataContext();

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        <Button className="flex items-center gap-2 h-[32px]" variant={"gunmetalArrow"}>
          Repay
          <ArrowRight height="18" width="18" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="text-lg font-semibold">
            Repay Loan
          </Dialog.Title>
          <Dialog.Description className="text-muted-foreground mt-2 text-sm">
            Repay a portion or all of exsisting balance.
          </Dialog.Description>

          <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
            <div className="flex flex-col gap-[2px]">
              <p className="text-muted-foreground text-sm font-light select-none">
                YOU RECEIVE
              </p>
              <PayInput
                value={collateralToReturn}
                onChangeFunction={setCollateralToReturn}
              />
            </div>
            <div className="bg-grey-450 flex w-fit min-w-fit items-center gap-1 rounded-full px-1.5 py-1">
              <div className="flex items-end">
                <Image
                  src={
                    metadata.data?.logoUri
                      ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                      : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
                  }
                  className="rounded-full"
                  alt={`Token Logo`}
                  width={24}
                  height={24}
                  style={{
                    minWidth: 24,
                    minHeight: 24,
                    flexShrink: 0,
                  }}
                />
  
                <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                  <ChainLogo
                    chainId={Number(1) as JBChainId}
                    height={16}
                    width={16}
                  />
                </div>
              </div>
              <p className="text-lg font-light">{"TOKENS"}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Dialog.Close asChild>
              <Button>
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant={"secondary"}>
              Next
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}*/


"use client"
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { Button } from "@/components/ui/button";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import * as Dialog from "@radix-ui/react-dialog";
import { JBChainId, useJBProjectMetadataContext, useJBTokenContext } from "juice-sdk-react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


export function RepayDialog() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"repay" | "refinance">("repay");
  const [collateralToReturn, setCollateralToReturn] = useState("");

  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();


  const setManualRepayAmount = (amt: number) => {
    return null;
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        <Button className="flex items-center gap-2 h-[32px]" variant={"gunmetalArrow"}>
          Repay
          <ArrowRight height="18" width="18" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="">
            <div className="">
              <Button 
                className={`${activeTab === "repay" && "background-color"} p-3 rounded-t-lg rounded-b-none hover:bg-transparent hover:underline`}
                onClick={() => setActiveTab("repay")}
              >
                Repay
              </Button>
              <Button
                className={`${activeTab === "refinance" && "background-color"} p-3 rounded-t-lg rounded-b-none hover:bg-transparent hover:underline`}
                onClick={() => setActiveTab("refinance")}
              >
                Refinance
              </Button>
            </div>

            <div className={`${activeTab === "refinance" ? "rounded-xl" : "rounded-[0_8px_8px_8px]"} background-color p-3 transition-all`}>
              <div className="flex flex-col gap-2">
                <Dialog.Title className="text-lg font-semibold">
                  Repay Loan
                </Dialog.Title>
                <p className="text-muted-foreground text-sm">
                  Amount of collateral you want to unlock
                </p>

                <div className="bg-grey-450 flex items-center justify-between gap-2 rounded-xl p-[16px]">
                  <div className="flex flex-col gap-[2px]">
                    <p className="text-muted-foreground text-sm font-light select-none">
                      YOU RECEIVE
                    </p>
                    <PayInput
                      value={collateralToReturn}
                      onChangeFunction={setCollateralToReturn}
                    />
                  </div>
                  <div className="background-color flex w-fit min-w-fit items-center gap-1 rounded-full px-1.5 py-1">
                    <div className="flex items-end">
                      <Image
                        src={
                          metadata.data?.logoUri
                            ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                            : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
                        }
                        className="rounded-full"
                        alt={`Token Logo`}
                        width={24}
                        height={24}
                        style={{
                          minWidth: 24,
                          minHeight: 24,
                          flexShrink: 0,
                        }}
                      />
        
                      <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                        <ChainLogo
                          chainId={Number(1) as JBChainId}
                          height={16}
                          width={16}
                        />
                      </div>
                    </div>
                    <p className="text-lg font-light">{token.data?.symbol ?? "TOKENS"}</p>
                  </div>
                </div>

                <div className="bg-grey-450 hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid">
                  <Button
                    className="h-[28px] rounded-l-lg rounded-r-xs"
                    variant={"secondary"}
                    onClick={() => {
                      setManualRepayAmount(10);
                    }}
                  >
                    10%
                  </Button>
                  <Button
                    className="h-[28px] rounded-xs"
                    variant={"secondary"}
                    onClick={() => {
                      setManualRepayAmount(25);
                    }}
                  >
                    25%
                  </Button>
                  <Button
                    className="h-[28px] rounded-xs"
                    variant={"secondary"}
                    onClick={() => {
                      setManualRepayAmount(50);
                    }}
                  >
                    50%
                  </Button>
                  <Button
                    className="h-[28px] rounded-l-xs rounded-r-lg"
                    variant={"secondary"}
                    onClick={() => {
                      setManualRepayAmount(100);
                    }}
                  >
                    MAX
                  </Button>
                </div>

                <div className="bg-grey-450 grid grid-cols-[60%_40%] text-sm rounded-lg p-3 [&>*:nth-child(odd)]:text-muted-foreground [&>*:nth-child(even)]:text-right">
                  <p>Current Borrow Amount:</p>
                  <p>1</p>
                  <p>Unlocked Collateral (%):</p>
                  <p>2</p>
                  <p>Amount To Pay Now:</p>
                  <p>3</p>
                  <p>Amount Carried Into New Loan:</p>
                  <p>4</p>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Dialog.Close asChild>
                    <Button>
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button variant={"secondary"}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}