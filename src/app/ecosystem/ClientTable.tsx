"use client";
import Image from "next/image";
import Link from "next/link";

import { useAccount } from "wagmi";
import { Address, formatUnits } from "viem";
import { formatNumber } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { getViemPublicClient } from "@/lib/wagmiConfig";
import { useFetchTokenPrices } from "@/hooks/queries/useFetchTokenPrices";
import { useEcosystemBalances } from "./useEcosystemBal";
import { useEcosystemSuckersBal } from "./useEcosystemSuckersBal";

interface ProjectType {
  name: string;
  logo: string;
  href: string;
  tokenAddress: Address;
  vestingContract?: Address;
}

interface SuckersProjectInterface {
  name: string;
  logo: string;
  href: string;
  suckersGroupId: string;
  vestingContract?: Address;
}

export const PROJECTS: ProjectType[] = [
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

const ProjectSuckers: SuckersProjectInterface[] = [
  {
    name: "Stasis",
    href: "stasis",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/stasis.webp",
    suckersGroupId: "a93b9ffae5b616880a64953c0515081a", // mainnet - Stasis Suckers Group ID
  }
];

const TOKEN_DECIMALS = 18;

export default function ClientTable() {
  const publicClient = getViemPublicClient(1);  // default to mainnet
  const { address, isConnected } = useAccount();

  const { data: tokenPriceData, isLoading: isTokenPriceLoading } = useFetchTokenPrices(PROJECTS.map(p => p.href));

  const {
    data: suckersBalances,
    isLoading: isSuckersBalancesLoading
  } = useEcosystemSuckersBal(
    address,
    ProjectSuckers.map((p) => p.suckersGroupId),
    isConnected,
  );

  const {
    data: erc20Balances,
    isLoading: isErc20BalancesLoading
  } = useEcosystemBalances(address, publicClient, isConnected);

  const isErc20Loading = isConnected && isErc20BalancesLoading;
  const isSuckersLoading = isConnected && isSuckersBalancesLoading;

  // Returns a formatted decimal string, "0" when disconnected, or null when unavailable
  const getErc20Balance = (tokenAddress: Address): string | null => {
    if (!isConnected) return "0";
    const balance = erc20Balances?.get(tokenAddress);
    return balance === undefined ? null : formatUnits(balance, TOKEN_DECIMALS);
  };

  const getSuckersBalance = (suckersGroupId: string): string => {
    if (!isConnected) return "0";
    return formatUnits(suckersBalances?.get(suckersGroupId) ?? 0n, TOKEN_DECIMALS);
  };

  return (
    <div className="bg-grey-450 flex flex-col gap-[12px] rounded-2xl p-[12px]">
      <h3 className="text-xl">Projects</h3>

      <div className="background-color rounded-xl p-[8px] font-light">
        {PROJECTS.map((project, index) => {
          const tokenPrice = tokenPriceData?.find(t => t.token === project.href)?.price;

          return (
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
                {isErc20Loading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(getErc20Balance(project.tokenAddress), true)}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {isErc20Loading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? formatNumber(getErc20Balance(project.vestingContract), true)
                      : "—"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">PRICE</span>
                <div className="flex items-center">
                  <span>$</span>
                  {isTokenPriceLoading
                    ? <div className="activeSkeleton h-[24px] w-[80px] ml-1 rounded-md" />
                    : tokenPrice 
                      ? formatNumber(tokenPrice)
                      : "0"
                  }
                </div>
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>
                <div className="flex items-center">
                  <span>$</span>
                  {isTokenPriceLoading || isErc20Loading
                    ? <div className="activeSkeleton h-[24px] w-[80px] ml-1 rounded-md" />
                    : tokenPrice 
                      ? formatNumber(tokenPrice * Number(getErc20Balance(project.tokenAddress) ?? 0))
                      : "0"
                  }
                </div>
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
                {isErc20Loading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(getErc20Balance(project.tokenAddress), true)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {isErc20Loading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? formatNumber(getErc20Balance(project.vestingContract), true)
                      : "—"}
                  </span>
                )}
              </div>

              {/** Small Viewport */}
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>
                <div className="flex items-center">
                  <span>$</span>
                  {isTokenPriceLoading || isErc20Loading
                    ? <div className="activeSkeleton h-[24px] w-[80px] ml-1 rounded-md" />
                    : tokenPrice 
                      ? formatNumber(tokenPrice * Number(getErc20Balance(project.tokenAddress) ?? 0))
                      : "0"
                  }
                </div>
              </div>

            </div>
          </div>
          )
        })}

        {ProjectSuckers.map((project, index) => (
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
                {isSuckersLoading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(getSuckersBalance(project.suckersGroupId), true)}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {isSuckersLoading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? formatNumber(getErc20Balance(project.vestingContract), true)
                      : "—"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">PRICE</span>
                $—
              </div>

              <div className="hidden flex-col gap-1 md:flex">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>
                $—
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
                {isSuckersLoading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {formatNumber(getSuckersBalance(project.suckersGroupId), true)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">vAMOUNT</span>
                {isSuckersLoading ? (
                  <div className="activeSkeleton h-[24px] w-[80px] rounded-md" />
                ) : (
                  <span>
                    {project.vestingContract
                      ? formatNumber(getErc20Balance(project.vestingContract), true)
                      : "—"}
                  </span>
                )}
              </div>

              {/** Small Viewport */}
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-sm">LIQUID VALUE</span>—
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
