"use client";
import { RelayrPaymentSelect } from "@/components/RelayrPaymentSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ipfsGatewayUrl, ipfsUri, ipfsUriToGatewayUrl } from "@/lib/ipfs/ipfs";
import { IpfsImageUploader } from "@/lib/ipfs/ipfsImageUploader";
import { pinProjectMetadata } from "@/lib/ipfs/pinProjectMetaData";
import { formatWalletError } from "@/lib/utils";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { getPublicClient } from "@wagmi/core";
import {
  JBChainId,
  jbControllerAbi,
  JBCoreContracts,
} from "juice-sdk-core";
import {
  ChainPayment,
  RelayrPostBundleResponse,
  useGetRelayrTxQuote,
  useJBContractContext,
  useJBProjectMetadataContext,
  useSendRelayrTx,
} from "juice-sdk-react";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { encodeFunctionData } from "viem";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";

export function EditMetadataDialog() {
  const { contractAddress } = useJBContractContext();
  const { metadata: metadataContext } = useJBProjectMetadataContext();
  const suckers = useRevnetDataStore((state) => state.suckers);
  const metadata = metadataContext.data;

  // Wagmi Hooks
  const { address, chainId: connectedChainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { toast } = useToast();

  const { getRelayrTxQuote, reset: resetRelayr } = useGetRelayrTxQuote();
  const { sendRelayrTx } = useSendRelayrTx();
  const [relayrQuote, setRelayrQuote] =
    useState<RelayrPostBundleResponse | null>(null);
  const [selectedPayment, selectPayment] = useState<ChainPayment | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [logo, setLogo] = useState("");
  const [newLogoCID, setNewLogoCID] = useState("");
  const [backdrop, setBackdrop] = useState("");
  const [newBackdropCID, setNewBackdropCID] = useState("");

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");
  const [website, setWebsite] = useState("");


  useEffect(() => {
    if (name) return;

    setName(metadata?.name ?? "");
    setDescription(metadata?.description ?? "");

    setLogo(ipfsUriToGatewayUrl(metadata?.logoUri ?? ""));
    setBackdrop(ipfsUriToGatewayUrl(metadata?.coverImageUri ?? ""));

    setTwitter(metadata?.twitter ?? "");
    setTelegram(metadata?.telegram ?? "");
    setDiscord(metadata?.discord ?? "");
    setWebsite(metadata?.infoUri ?? "");
  }, [metadataContext]);

  const resetQuote = () => {
    setRelayrQuote(null);
    selectPayment(null);
    resetRelayr();
  };

  const handleSubmit = async () => {
    try {
      if (!address || !suckers) throw new Error("No address or suckers found");

      setIsLoading(true);

      const metadataCid = await pinProjectMetadata({
        name,
        description, // review formatting
        logoUri: newLogoCID ? ipfsUri(newLogoCID) : metadata?.logoUri,
        coverImageUri: newBackdropCID
          ? ipfsUri(newBackdropCID)
          : metadata?.coverImageUri,
        twitter,
        telegram,
        discord,
        infoUri: website,
      });

      const metadataUri = ipfsUri(metadataCid);

      // Single chain - use direct writeContract
      if (suckers.length === 1) {
        const project = suckers[0];
        const chainId = project.peerChainId as JBChainId;

        if (connectedChainId !== chainId) {
          await switchChainAsync({ chainId });
        }

        await writeContractAsync({
          abi: jbControllerAbi,
          functionName: "setUriOf",
          chainId,
          address: contractAddress(JBCoreContracts.JBController, chainId),
          args: [BigInt(project.projectId), metadataUri],
        });

        toast({
          title: "Transaction submitted",
          description: "Awaiting confirmation...",
        });

        return;
      }

      // Multi-chain - use relayr
      const relayrTransactions = [];

      for (const sucker of suckers) {
        const { peerChainId: chainId, projectId } = sucker;

        const controller = contractAddress(
          JBCoreContracts.JBController,
          chainId
        );
        const args = [BigInt(projectId), metadataUri] as const;

        const gasEstimate = await getPublicClient(wagmiConfig, {
          chainId,
        }).estimateContractGas({
          address: controller,
          abi: jbControllerAbi,
          functionName: "setUriOf",
          args,
          account: address,
        });

        relayrTransactions.push({
          data: {
            from: address,
            to: controller,
            value: 0n,
            gas: gasEstimate + 50_000n,
            data: encodeFunctionData({
              abi: jbControllerAbi,
              functionName: "setUriOf",
              args,
            }),
          },
          chainId,
        });
      }

      const quote = await getRelayrTxQuote(relayrTransactions);
      if (!quote) throw new Error("Failed to get relayr tx quote");

      setRelayrQuote(quote);
      selectPayment(
        quote.payment_info.find((q) => q.chain === suckers[0].peerChainId) ||
          quote.payment_info[0]
      );
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formatWalletError(e) || "Failed to update metadata",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayAndSubmit = async () => {
    if (!relayrQuote || !selectedPayment || !sendRelayrTx) return;

    setIsLoading(true);

    try {
      await sendRelayrTx(selectedPayment);

      toast({
        title: "Metadata updated!",
        description: "New data will be visible shortly.",
      });
      //onSuccess();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formatWalletError(e) || "Failed to submit transaction",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const valuesHaveChanged =
    !!metadata &&
    (name !== (metadata?.name ?? "") ||
      description !== (metadata?.description ?? "") ||
      twitter !== (metadata?.twitter ?? "") ||
      telegram !== (metadata?.telegram ?? "") ||
      discord !== (metadata?.discord ?? "") ||
      website !== (metadata?.infoUri ?? "") ||
      newBackdropCID ||
      newLogoCID);

  return (
    <Dialog
      onOpenChange={() => {
        resetQuote();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={"accent"}>
          Edit Project Metadata
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Edit Metadata</DialogTitle>
        <DialogDescription>
          Update the project name, logo, and description.
        </DialogDescription>

        <div className="my-3">
          <IpfsImageUploader
            setCID={setNewBackdropCID}
            disabled={!!relayrQuote}
          >
            <div className="group relative h-[128px] w-full cursor-pointer">
              {backdrop || newBackdropCID ? (
                <Image
                  src={
                    newBackdropCID ? ipfsGatewayUrl(newBackdropCID) : backdrop
                  }
                  alt={"project header image"}
                  className="inset-0 h-full w-full rounded object-cover"
                  width={600}
                  height={400}
                />
              ) : (
                <div className="background-color inset-0 flex h-full w-full items-center justify-center rounded py-8 opacity-60">
                  <Image
                    src="https://cdn.inevitable.science/static/img/branding/logo.svg"
                    alt="placeholder header image"
                    className="h-16 w-auto"
                    width={1800}
                    height={1200}
                  />
                </div>
              )}

              <div className="background-color absolute top-0 flex h-full w-full items-center justify-center rounded opacity-0 transition-all group-hover:opacity-55">
                <Pencil height={32} width={32} />
              </div>
            </div>
          </IpfsImageUploader>

          <IpfsImageUploader setCID={setNewLogoCID} disabled={!!relayrQuote}>
            <div className="background-color group relative z-10 -mt-18 ml-4 flex h-[90px] w-[90px] cursor-pointer items-center justify-center rounded-xl p-[3px] shadow">
              {logo || newLogoCID ? (
                <Image
                  src={newLogoCID ? ipfsGatewayUrl(newLogoCID) : logo}
                  className="border-background block h-full w-full overflow-hidden rounded-lg"
                  alt={"Project Logo"}
                  width={90}
                  height={90}
                />
              ) : (
                <Image
                  src={
                    "https://cdn.inevitable.science/static/img/branding/icon.svg"
                  }
                  className="border-background block h-[50px] max-h-full w-auto max-w-full overflow-hidden"
                  alt={"Project Logo"}
                  width={90}
                  height={90}
                />
              )}

              <div className="background-color absolute z-20 flex h-full w-full items-center justify-center rounded-xl opacity-0 transition-all group-hover:opacity-55">
                <Pencil height={32} width={32} />
              </div>
            </div>
          </IpfsImageUploader>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Project Name</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!relayrQuote || !metadata?.name}
            />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Project Description</p>
            <textarea
              className="background-color border-color placeholder:text-muted-foreground flex h-90 resize-none rounded bg-transparent font-light ring-0"
              placeholder="..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!!relayrQuote}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">Twitter (X)</p>
              <Input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                disabled={!!relayrQuote}
                placeholder="MyUsername"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">Telegram</p>
              <Input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                disabled={!!relayrQuote}
                placeholder="t.me/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">Discord</p>
              <Input
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                disabled={!!relayrQuote}
                placeholder="discord.gg/..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">Website</p>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={!!relayrQuote}
                placeholder="mysite.com"
              />
            </div>
          </div>
          
          {/* TODO: Make this select dropdown look better */}
          {relayrQuote ? (
            <div className="flex items-center justify-end gap-4">
              <RelayrPaymentSelect
                payments={relayrQuote.payment_info.filter((quote) =>
                  suckers?.some((s) => s.peerChainId === quote.chain)
                )}
                selectedPayment={selectedPayment}
                onSelectPayment={selectPayment}
                disabled={isLoading}
              />
              <Button
                className="bg-cerulean! min-w-30"
                onClick={handlePayAndSubmit}
                loading={isLoading}
              >
                Pay and submit
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <DialogClose>Cancel</DialogClose>
              <Button
                className="bg-cerulean! min-w-30"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!valuesHaveChanged}
              >
                {suckers?.length === 1 ? "Pay" : "Get Quote"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
