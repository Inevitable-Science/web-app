"use client";

import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import {
  scheduleCreateRole,
  vestingContracts,
} from "../../../lib/vesting/constants";
import { useEffect } from "react";
import { getViemPublicClient } from "@/lib/wagmiConfig";
import { getContract } from "viem";
import { vestingAbi } from "../../../lib/vesting/vestingAbi";
import { useAccount } from "wagmi";

export function VestingInitialiser({
  children,
}: {
  children: React.ReactNode;
}) {
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const setVestingContractAddress = useLegacyProjectStore(
    (state) => state.setVestingContractAddress
  );
  const setVestingChainId = useLegacyProjectStore(
    (state) => state.setVestingChainId
  );

  const setIsOwner = useLegacyProjectStore((state) => state.setIsOwner);
  const setCanCreate = useLegacyProjectStore((state) => state.setCanCreate);

  const { address, isConnected } = useAccount();

  const vestingContractObj = vestingContracts.find(
    (d) => daoData.name.toLowerCase() === d.name
  );
  const contractAddress = vestingContractObj?.vestingContract;
  const chainId = vestingContractObj?.vestingContractChainId;

  if (contractAddress && chainId) {
    setVestingContractAddress(contractAddress);
    setVestingChainId(chainId);
  }

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!contractAddress || !chainId || !address) return;

      const client = getViemPublicClient(
        vestingContractObj?.vestingContractChainId
      );
      const vestingContract = getContract({
        address: contractAddress,
        abi: vestingAbi,
        client,
      });

      try {
        const [hasRole, owner] = await Promise.all([
          vestingContract.read.hasRole([scheduleCreateRole, address]),
          vestingContract.read.owner(),
        ]);

        if (owner.toLowerCase() === address.toLowerCase()) {
          setIsOwner(true);
          setCanCreate(true);
        } else if (hasRole) {
          setCanCreate(true);
        }
      } catch (e) {
        console.log("error fetching roles", e);
      }
    };

    fetchPermissions();
  }, [address, isConnected]);

  return <>{children}</>;
}
