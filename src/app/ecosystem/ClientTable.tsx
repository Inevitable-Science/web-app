"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { getBalance } from "@wagmi/core"
import { Address, formatUnits } from "viem"
import { wagmiConfig } from "@/lib/wagmiConfig";
import { formatNumber } from "@/lib/utils";

import { ArrowRightIcon } from "lucide-react";


interface projectInterface{
  name: string,
  logo: string;
  href: string;
  tokenAddress: Address;
  vestingContract?: Address;
}

interface v4ProjectInterface{
  name: string,
  logo: string;
  href: string;
  projectID: number;
  vestingContract?: Address;
}

type Participant = {
  balance: string;
  erc20Balance: string;
  creditBalance: string;
};

type ProjectBalanceMap = Record<string, bigint | string>;

const projectVars: projectInterface[] = [
  {
    name: "HydraDAO",
    href: "hydradao",
    logo: "/assets/img/daos/tokenLogos/hydra.svg",
    tokenAddress: "0xaF04f0912E793620824F4442b03F4d984Af29853",
    vestingContract: "0x87d83a88cdc3bfe53877cf852013fc76c8669a99",
  },
  {
    name: "CryoDAO",
    href: "cryodao",
    logo: "/assets/img/daos/tokenLogos/cryo.svg",
    tokenAddress: "0xf4308b0263723b121056938c2172868e408079d0",
    vestingContract: "0xF5BdfeE7910c561606e6A19Bbf0319238A6a2340",
  },
  {
    name: "Erectus",
    href: "erectusdao",
    logo: "/assets/img/daos/tokenLogos/yuge.svg",
    tokenAddress: "0xFdc9D2A3cae56e484a85de3C2e812784a8184d0D",
    vestingContract: "0xD8D29d907C248BE3721C0c434c792a127113b297",
  },
  {
    name: "CryoRat",
    href: "cryorat",
    logo: "/assets/img/daos/tokenLogos/cryorat.png",
    tokenAddress: "0x4cd1B2874e020C5bf08c4bE18Ab69ca86EC25fEf",
    vestingContract: "0x9dad05FAD7b20C8bb66e5b7796a4E601967e2868",
  },
];

const v4ProjectVars: v4ProjectInterface[] = [
  {
    name: "Stasis",
    href: "stasis",
    logo: "/assets/img/daos/tokenLogos/stasis.svg",
    projectID: 64,
  },
]

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
      const endpoint = 'https://bendystraw.xyz/schema';

      const query = `
        query MyQuery($chainId: Float!, $projectId: Float!, $address: String!) {
          participant(
            projectId: $projectId,
            address: $address,
            chainId: $chainId
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
                  variables: { chainId, projectId: projectID, address },
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

        const parsed = balanceResults.reduce((acc, bal, index) => {
          const raw = Number(formatUnits(bal.value, bal.decimals));
          let formatted: string;

          if (raw < 1000) {
            formatted = raw.toFixed(2);
          } else {
            formatted = formatNumber(raw, true);
          }
          acc[contracts[index]] = formatted;
          return acc;
        }, {} as Record<string, string>);

        setBalances(parsed);
      } catch (err) {
        console.error("Error fetching token balances:", err);
      }
    };

    if (isSwitchingChain === false) {
      fetchBalances();
    }
  }, [address, isConnected, isSwitchingChain]);


  return(
  <div className="bg-grey-450 flex flex-col gap-[12px] p-[12px] rounded-2xl">
    <h3 className="text-xl">Projects</h3>

    <div className="background-color p-[8px] rounded-xl font-light">
      {projectVars.map((project, index) => (
        <div key={index} className="border-b border-grey-500">
          <div
            className="md:grid md:grid-cols-[auto_3fr_3fr_2fr_4fr_auto] flex justify-between items-center gap-4 py-2 items-center"
          >
            <div className="py-2 flex items-center gap-2 w-[170px] lg:w-[225px]">
              <Image
                src={project.logo}
                alt={project.name}
                height={32}
                width={32}
              />
              <h4 className="text-lg pl-2">
                {project.name}
              </h4>
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                AMOUNT
              </span>
              {Object.keys(balances).length === 0 ? (
                <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
              ) : (
                <span>
                  {balances[project.tokenAddress]}
                </span>
              )}
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                vAMOUNT
              </span>
              {Object.keys(balances).length === 0 ? (
                <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
              ) : (
                <span>
                  {project.vestingContract ? balances[project.vestingContract] : "—"}
                </span>
              )}
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                PRICE
              </span>
              0
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                LIQUID VALUE
              </span>
              0
            </div>

            <button className="focus:outline-none py-[6px] px-[12px] rounded-full bg-gunmetal font-normal">
              <Link href={`/project/${project.href}`} className="flex items-center gap-2">
                Buy
                <ArrowRightIcon height="18" width="18" />
              </Link>
            </button>
          </div>

          <div className="md:hidden grid grid-cols-[2fr_2fr_3fr] gap-4 items-center mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-grey-50 text-sm">
                AMOUNT
              </span>
              0
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-grey-50 text-sm">
                vAMOUNT
              </span>
              0
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-grey-50 text-sm">
                LIQUID VALUE
              </span>
              0
            </div>
          </div>
        </div>
      ))}




      {v4ProjectVars.map((project, index) => (
        <div key={index} className="border-b border-grey-500">
          <div
            className="md:grid md:grid-cols-[auto_3fr_3fr_2fr_4fr_auto] flex justify-between items-center gap-4 py-2 items-center"
          >
            <div className="py-2 flex items-center gap-2 w-[170px] lg:w-[225px]">
              <Image
                src={project.logo}
                alt={project.name}
                height={32}
                width={32}
              />
              <h4 className="text-lg pl-2">
                {project.name}
              </h4>
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                AMOUNT
              </span>
              {Object.keys(v4Balances).length === 0 ? (
                <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
              ) : (
                <span>
                  {formatNumber(Number(formatUnits(v4Balances[project.projectID] as bigint, 18)))}
                </span>
              )}
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                vAMOUNT
              </span>
              {Object.keys(balances).length === 0 ? (
                <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
              ) : (
                <span>
                  {project.vestingContract ? balances[project.vestingContract] : "—"}
                </span>
              )}
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                PRICE
              </span>
              0
            </div>

            <div className="md:flex flex-col gap-1 hidden">
              <span className="text-grey-50 text-sm">
                LIQUID VALUE
              </span>
              0
            </div>

            <button className="focus:outline-none py-[6px] px-[12px] rounded-full bg-gunmetal font-normal">
              <Link href={`/project/${project.href}`} className="flex items-center gap-2">
                Buy
                <ArrowRightIcon height="18" width="18" />
              </Link>
            </button>
          </div>

          <div className="md:hidden grid grid-cols-[2fr_2fr_3fr] gap-4 items-center mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-grey-50 text-sm">
                AMOUNT
              </span>
              0
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-grey-50 text-sm">
                vAMOUNT
              </span>
              0
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-grey-50 text-sm">
                LIQUID VALUE
              </span>
              0
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}