"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAccount, usePublicClient } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";
import { formatNumber } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { getViemPublicClient } from "@/lib/wagmiConfig";

type BalanceMap = Record<string, string>;

interface ProjectType {
  name: string;
  logo: string;
  href: string;
  tokenAddress: Address;
  vestingContract?: Address;
}

interface v4ProjectInterface {
  name: string;
  logo: string;
  href: string;
  projectID: number;
  vestingContract?: Address;
}

interface Participant {
  balance: string;
  erc20Balance: string;
  creditBalance: string;
}

const PROJECTS: ProjectType[] = [
  {
    name: "HydraDAO",
    href: "hydradao",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/hydra.svg",
    tokenAddress: "0xaF04f0912E793620824F4442b03F4d984Af29853",
    vestingContract: "0x87d83a88cdc3bfe53877cf852013fc76c8669a99",
  },
  {
    name: "CryoDAO",
    href: "cryodao",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/cryo.svg",
    tokenAddress: "0xf4308b0263723b121056938c2172868e408079d0",
    vestingContract: "0xF5BdfeE7910c561606e6A19Bbf0319238A6a2340",
  },
  {
    name: "Erectus",
    href: "erectusdao",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/yuge.svg",
    tokenAddress: "0xFdc9D2A3cae56e484a85de3C2e812784a8184d0D",
    vestingContract: "0xD8D29d907C248BE3721C0c434c792a127113b297",
  },
  {
    name: "CryoRat",
    href: "cryorat",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/cryorat.webp",
    tokenAddress: "0x4cd1B2874e020C5bf08c4bE18Ab69ca86EC25fEf",
    vestingContract: "0x9dad05FAD7b20C8bb66e5b7796a4E601967e2868",
  },
];

const v4ProjectVars: v4ProjectInterface[] = [
  {
    name: "Stasis",
    href: "stasis",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/stasis.webp",
    projectID: 64,
  },
];

export default function ClientTable() {
  const client = getViemPublicClient(1);  // default to mainnet
  const { address, isConnected } = useAccount();

  const [balances, setBalances] = useState<BalanceMap | null>(null);
  const [v4Balances, setV4Balances] = useState<BalanceMap | null>(null);

  const fetchBalances = async () => {
    try {
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

      if (!isConnected) {
        const fallback: BalanceMap = {};
        for (const c of contracts) {
          fallback[c.address] = "0";
        }

        setBalances(fallback);
        return;
      }

      const result = await client.multicall({ contracts });

      const balances: BalanceMap = {};
      let index = 0;

      for (const bal of result) {
        if (bal.status !== "success") continue;

        const formattedBalance = formatUnits(bal.result, 18);
        const tokenAddress = contracts[index++].address;
        balances[tokenAddress] = formattedBalance;
      }

      setBalances(balances);
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
    }
  };

  const fetchGraphQLQuery = async () => {
    try {
      if (!isConnected) {
        const fallback: Record<string, string> = {};

        v4ProjectVars.forEach((project) => {
          fallback[project.projectID.toString()] = "0";
          if (project.vestingContract) {
            fallback[project.vestingContract] = "0";
          }
        });

        setV4Balances(fallback);
        return;
      }

      const chainIds = [1, 10, 42161, 8453];
      const endpoint = "https://bendystraw.xyz/schema";

      const query = `
        query MyQuery($chainId: Float!, $projectId: Float!, $address: String!, $version: Float!) {
          participant(
            projectId: $projectId,
            address: $address,
            chainId: $chainId,
            version: $version
          ) {
            balance
            erc20Balance
            creditBalance
          }
        }
      `;

      const balances: BalanceMap = {};

      await Promise.all(
        v4ProjectVars.map(async ({ projectID }) => {
          const chainResults = await Promise.all(
            chainIds.map(async (chainId) => {
              const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  query,
                  variables: {
                    chainId,
                    projectId: projectID,
                    address,
                    version: 4,
                  },
                }),
              });

              const json = await res.json();
              console.log(json);
              const participant: Participant | null = json.data.participant;

              if (!participant) return BigInt(0);

              const balance = BigInt(participant.balance || "0");
              const erc20Balance = BigInt(participant.erc20Balance || "0");
              const creditBalance = BigInt(participant.creditBalance || "0");

              return balance;
            })
          );

          // Sum across all chains for this project
          const totalBalance = chainResults.reduce(
            (sum, val) => sum + val,
            BigInt(0)
          );

          const formattedBalance = formatUnits(totalBalance, 18);

          balances[projectID.toString()] = formattedBalance;
        })
      );

      setV4Balances(balances);
      return;
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    fetchBalances();
    fetchGraphQLQuery();
  }, [isConnected]);

  return (
    <div className="bg-grey-450 flex flex-col gap-[12px] rounded-2xl p-[12px]">
      <h3 className="text-xl">Projects</h3>

      <div className="background-color rounded-xl p-[8px] font-light">
        {PROJECTS.map((project, index) => (
          <div key={index} className="border-grey-500 border-b">
            <div className="flex items-center justify-between gap-4 py-2 md:grid md:grid-cols-[auto_3fr_3fr_2fr_4fr_auto]">
              <div className="flex w-[170px] items-center gap-2 py-2 lg:w-[225px]">
                <Image
                  src={project.logo}
                  alt={project.name}
                  height={32}
                  width={32}
                />
                <h4 className="pl-2 text-lg">{project.name}</h4>
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">AMOUNT</span>
                {balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(balances[project.tokenAddress], true)}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? formatNumber(balances[project.vestingContract], true)
                      : "—"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">PRICE</span>0
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>0
              </div>

              <button className="bg-gunmetal rounded-full px-[12px] py-[6px] font-normal focus:outline-hidden">
                <Link
                  href={`/project/${project.href}`}
                  className="flex items-center gap-2"
                >
                  Buy
                  <ArrowRightIcon height="18" width="18" />
                </Link>
              </button>
            </div>

            <div className="mb-3 grid grid-cols-[2fr_2fr_3fr] items-center gap-4 md:hidden">
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">AMOUNT</span>
                {balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(balances[project.tokenAddress], true)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? formatNumber(balances[project.vestingContract], true)
                      : "—"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>0
              </div>
            </div>
          </div>
        ))}

        {v4ProjectVars.map((project, index) => (
          <div key={index} className="border-grey-500 border-b">
            <div className="flex items-center justify-between gap-4 py-2 md:grid md:grid-cols-[auto_3fr_3fr_2fr_4fr_auto]">
              <div className="flex w-[170px] items-center gap-2 py-2 lg:w-[225px]">
                <Image
                  src={project.logo}
                  alt={project.name}
                  height={32}
                  width={32}
                />
                <h4 className="pl-2 text-lg">{project.name}</h4>
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">AMOUNT</span>
                {v4Balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(v4Balances[project.projectID], true)}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {v4Balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? v4Balances[project.vestingContract]
                      : "—"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">PRICE</span>0
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>0
              </div>

              <button className="bg-gunmetal rounded-full px-[12px] py-[6px] font-normal focus:outline-hidden">
                <Link
                  href={`/@${project.href}`}
                  className="flex items-center gap-2"
                >
                  Buy
                  <ArrowRightIcon height="18" width="18" />
                </Link>
              </button>
            </div>

            <div className="mb-3 grid grid-cols-[2fr_2fr_3fr] items-center gap-4 md:hidden">
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">AMOUNT</span>
                {v4Balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(v4Balances[project.projectID], true)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {v4Balances === null ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? v4Balances[project.vestingContract]
                      : "—"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>0
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
