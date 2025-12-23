"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getBalance } from "@wagmi/core";
import { Address, formatUnits } from "viem";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { formatNumber } from "@/lib/utils";

import { ArrowRightIcon } from "lucide-react";

interface projectInterface {
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

type ProjectBalanceMap = Record<string, bigint | string>;

const projectVars: projectInterface[] = [
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
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/stasis.svg",
    projectID: 64,
  },
];

export default function ClientTable() {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [v4Balances, setV4Balances] = useState<ProjectBalanceMap>({});

  const userChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  useEffect(() => {
    if (!address || !isConnected) {
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

    const fetchGraphQLQuery = async () => {
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

      const balances: ProjectBalanceMap = {};

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

          balances[projectID.toString()] = totalBalance;
        })
      );

      setV4Balances(balances);
    };

    fetchGraphQLQuery();
  }, [address, isConnected]);

  useEffect(() => {
    if (!address || !isConnected) {
      const fallback: Record<string, string> = {};

      projectVars.forEach((project) => {
        fallback[project.tokenAddress] = "0";
        if (project.vestingContract) {
          fallback[project.vestingContract] = "0";
        }
      });

      setBalances(fallback);
      return;
    }

    const fetchBalances = async () => {
      try {
        if (userChainId !== 1) {
          switchChain({ chainId: 1 });
        }

        const contracts: Address[] = projectVars.flatMap((project) => {
          const list: Address[] = [project.tokenAddress];
          if (project.vestingContract) list.push(project.vestingContract);
          return list;
        });

        const balanceResults = await Promise.all(
          contracts.map((token) =>
            getBalance(wagmiConfig, {
              address,
              token,
            })
          )
        );

        const parsed = balanceResults.reduce(
          (acc, bal, index) => {
            const raw = Number(formatUnits(bal.value, bal.decimals));
            let formatted: string;

            if (raw < 1000) {
              formatted = raw.toFixed(2);
            } else {
              formatted = formatNumber(raw, true);
            }
            acc[contracts[index]] = formatted;
            return acc;
          },
          {} as Record<string, string>
        );

        setBalances(parsed);
      } catch (err) {
        console.error("Error fetching token balances:", err);
      }
    };

    if (isSwitchingChain === false) {
      fetchBalances();
    }
  }, [address, isConnected, isSwitchingChain]);

  return (
    <div className="flex flex-col gap-[12px] rounded-2xl bg-grey-450 p-[12px]">
      <h3 className="text-xl">Projects</h3>

      <div className="background-color rounded-xl p-[8px] font-light">
        {projectVars.map((project, index) => (
          <div key={index} className="border-b border-grey-500">
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
                <span className="text-sm text-grey-50">AMOUNT</span>
                {Object.keys(balances).length === 0 ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>{balances[project.tokenAddress]}</span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-sm text-grey-50">vAMOUNT</span>
                {Object.keys(balances).length === 0 ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? balances[project.vestingContract]
                      : "—"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-sm text-grey-50">PRICE</span>0
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-sm text-grey-50">LIQUID VALUE</span>0
              </div>

              <button className="rounded-full bg-gunmetal px-[12px] py-[6px] font-normal focus:outline-hidden">
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
                <span className="text-sm text-grey-50">AMOUNT</span>0
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-grey-50">vAMOUNT</span>0
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-grey-50">LIQUID VALUE</span>0
              </div>
            </div>
          </div>
        ))}

        {v4ProjectVars.map((project, index) => (
          <div key={index} className="border-b border-grey-500">
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
                <span className="text-sm text-grey-50">AMOUNT</span>
                {Object.keys(v4Balances).length === 0 ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(
                      Number(
                        formatUnits(v4Balances[project.projectID] as bigint, 18)
                      )
                    )}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-sm text-grey-50">vAMOUNT</span>
                {Object.keys(balances).length === 0 ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? balances[project.vestingContract]
                      : "—"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-sm text-grey-50">PRICE</span>0
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-sm text-grey-50">LIQUID VALUE</span>0
              </div>

              <button className="rounded-full bg-gunmetal px-[12px] py-[6px] font-normal focus:outline-hidden">
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
                <span className="text-sm text-grey-50">AMOUNT</span>0
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-grey-50">vAMOUNT</span>0
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-grey-50">LIQUID VALUE</span>0
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
