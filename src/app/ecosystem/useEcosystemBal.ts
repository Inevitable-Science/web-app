/**
 * Old ERC20 tokens get a special hook
 * will be depreciated in near future
 */

import { useQuery } from "@tanstack/react-query";
import { Address, erc20Abi, PublicClient } from "viem";
import { PROJECTS } from "./ClientTable";

const fetchBalances = async (address: Address | undefined, publicClient: PublicClient) => {
  const tokenBalances = new Map<string, bigint>();

  try {

    if (!address) {
      PROJECTS.forEach((project) => {
        tokenBalances.set(project.tokenAddress, 0n);
      });

      return tokenBalances;
    };

    const contracts = PROJECTS.flatMap(
      ({ tokenAddress, vestingContract }) => {
        const entries = [
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address] as [Address],
          },
        ];

        if (vestingContract) {
          entries.push({
            address: vestingContract,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address] as [Address],
          });
        }

        return entries;
      }
    );

    const result = await publicClient.multicall({ contracts });

    result.forEach((balance, index) => {
      if (balance.status !== "success") return;
      tokenBalances.set(contracts[index].address, balance.result);
    });

    return tokenBalances;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const useEcosystemBalances = (
  address: Address | undefined,
  publicClient: PublicClient,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["ecosystem_balances", address],
    queryFn: () => fetchBalances(address, publicClient),
    enabled: !!address && enabled,
    staleTime: 300000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
};
