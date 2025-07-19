"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAccount } from "wagmi";
import { getBalance } from '@wagmi/core'
import { Address, formatUnits } from "viem"
import { wagmiConfig } from "@/lib/wagmiConfig";
import { formatNumber } from "@/lib/utils";

import { ArrowRightIcon } from "lucide-react";

// TODO: allow for ERC 721 token balance to appear

interface statItem{
  name: string, 
  logo: string;
  tokenAddress: Address;
  vestingContract?: Address;
}

const dummyStats: statItem[] = [
  { 
    name: "HydraDAO", 
    logo: "https://www.profiler.bio/external/logos/hydradao.png",
    tokenAddress: "0xaF04f0912E793620824F4442b03F4d984Af29853",
    vestingContract: "0x87d83a88cdc3bfe53877cf852013fc76c8669a99",
  },
  { 
    name: "CryoDAO", 
    logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg",
    tokenAddress: "0xf4308b0263723b121056938c2172868e408079d0",
    vestingContract: "0xF5BdfeE7910c561606e6A19Bbf0319238A6a2340",
  },
  { 
    name: "Erectus", 
    logo: "https://www.profiler.bio/external/logos/erectusdao.png", 
    tokenAddress: "0xFdc9D2A3cae56e484a85de3C2e812784a8184d0D",
    vestingContract: "0xD8D29d907C248BE3721C0c434c792a127113b297",
  },
  { 
    name: "MoonDAO", 
    logo: "https://www.profiler.bio/external/logos/moondao.png",
    tokenAddress: "0x20d4DB1946859E2Adb0e5ACC2eac58047aD41395",
  },
  /*{ 
    name: "Stasis", 
    logo: "https://cdn.prod.website-files.com/643d6a447c6e1b4184d3ddfd/643d7ebba7e71c58cdb21f5a_CryoDAO-icon-black.svg",
    tokenAddress: "0x732f0736ea540e7b4d38e948cfcfdb81024377d9"
  },*/
];

export default function ClientTable() {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<Record<string, string>>({});
  

  useEffect(() => {
    if (!address || !isConnected) return;

    const fetchBalances = async () => {
      try {
        const contracts: Address[] = dummyStats.flatMap((token) => {
          const list: Address[] = [token.tokenAddress];
          if (token.vestingContract) list.push(token.vestingContract);
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

    fetchBalances();
  }, [address, isConnected]);

  useEffect(() => {
    console.log(balances);
  }, [balances]);



  return(
  <div className="bg-grey-450 flex flex-col gap-[12px] p-[12px] rounded-2xl">
    <h3 className="text-xl">Projects</h3>

    <div className="background-color p-[8px] rounded-xl font-light">
      {dummyStats.map((project, index) => (
        <div key={index} className="border-b border-grey-500">
          <div
            className="md:grid md:grid-cols-[auto_3fr_3fr_2fr_4fr_auto] flex justify-between items-center gap-4 py-2 items-center"
          >
            <div className="py-2 flex items-center gap-2 w-[170px] lg:w-[225px]">
              <Image
                src={project.logo}
                alt={project.name}
                className="brightness-0 invert"
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
              <Link href="/eth:64" className="flex items-center gap-2">
                Invest
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