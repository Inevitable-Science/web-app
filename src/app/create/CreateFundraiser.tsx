"use client";

import { useToast } from "@/components/ui/use-toast";
import { Formik } from "formik";
import { createSalt, parseSuckerDeployerConfig } from "juice-sdk-core";
import { useGetRelayrTxQuote } from "juice-sdk-react";
import { useState } from "react";
import { revDeployerAbi, revDeployerAddress } from "revnet-sdk";
import { encodeFunctionData } from "viem";
import { useAccount } from "wagmi";
import { DEFAULT_FORM_DATA } from "./constants";
import { DeployRevnetForm } from "./form/DeployRevnetForm";
import { parseDeployData } from "./helpers/parseDeployData";
import { pinProjectMetadata } from "./helpers/pinProjectMetaData";
import { RevnetFormData } from "./types";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { getPublicClient } from "@wagmi/core";

export default function CreateFundraiser() {
  const [isLoadingIpfs, setIsLoadingIpfs] = useState<boolean>(false);
  const { toast } = useToast();
  const { address } = useAccount();

  const { getRelayrTxQuote, isPending, data } = useGetRelayrTxQuote();

  const isLoading = isLoadingIpfs || isPending;

  async function deployProject(formData: RevnetFormData) {
    console.log({ formData });

    if (!address) {
      console.warn("no wallet connected, aborting deploy");
      return;
    }

    // Upload metadata
    setIsLoadingIpfs(true);
    const metadataCid = await pinProjectMetadata({
      name: formData.name,
      description: formData.description,
      logoUri: formData.logoUri,
    });
    setIsLoadingIpfs(false);

    const salt = createSalt();

    const relayrTransactions = [];
    for (const chainId of formData.chainIds) {
      const suckerDeployerConfig = parseSuckerDeployerConfig(chainId, formData.chainIds);
      const deployData = parseDeployData(formData, {
        metadataCid,
        chainId,
        suckerDeployerConfig,
        salt,
      });

      console.log({ deployData });

      const encodedData = encodeFunctionData({
        abi: revDeployerAbi,
        functionName: "deployWith721sFor",
        args: deployData,
      });

      const publicClient = getPublicClient(wagmiConfig, {
        chainId: chainId,
      });

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // Estimate gas for the transaction
      const gasEstimate = await publicClient.estimateContractGas({
        address: revDeployerAddress[chainId],
        abi: revDeployerAbi,
        functionName: "deployWith721sFor",
        args: deployData,
      });

      console.log("create::deploy calldata", chainId, gasEstimate, encodedData, deployData);

      relayrTransactions.push({
        data: {
          from: address,
          to: revDeployerAddress[chainId],
          value: 0n,
          gas: gasEstimate + BigInt(120_000n), // Buffer for trustedForwarder
          data: encodedData,
        },
        chainId,
      });
    }

    await getRelayrTxQuote(relayrTransactions);
  }

  return (
    <>
      {/*<Nav />*/}
      <Formik
        initialValues={DEFAULT_FORM_DATA}
        onSubmit={(formData: RevnetFormData) => {
          try {
            deployProject?.(formData);
          } catch (e: any) {
            setIsLoadingIpfs(false);
            toast({
              variant: "destructive",
              title: "Error",
              description: e.message || "Error encoding transaction",
            });
            console.error(e);
          }
        }}
      >
        <DeployRevnetForm relayrResponse={data} isLoading={isLoading} />
      </Formik>
    </>
  );
}