"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatUnits } from "viem";
import { formatNumber } from "@/lib/utils";
// import CircularGauge from "./CircularGague";

const AuctionComponent: React.FC = () => {
  const [projectVolume, setProjectVolume] = useState<bigint | null | undefined>();
  /*const [gaugeSize, setGaugeSize] = useState(120); // Default to large

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setGaugeSize(100);
      } else {
        setGaugeSize(120);
      }
    };

    // Call it once on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);*/
  
  const endpoint = `${process.env.NEXT_PUBLIC_BENDYSTRAW_URL}/graphql`;
  const query = `
    query FetchVolume($chainId: Float!, $projectId: Float!) {
      project(
        chainId: $chainId,
        projectId: $projectId
      ) {
        volume
      }
    }`;

  useEffect(() => {
    const fetchVolume = async () => {
      try {
        if (!endpoint) throw new Error("No Bendystraw endpoint found");
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { chainId: 1, projectId: 64 }
          })
        })
        if (!response.ok) throw new Error("Could not fetch project volume");

        const data = await response.json();
        setProjectVolume(data.data.project.volume);
        return;
      } catch (err) {
        console.log(err);
        setProjectVolume(null);
        return;
      }
    }

    fetchVolume();
  }, []);



  return (
    <section className="bg-[url('/assets/img/auction_bg.webp')] bg-cover bg-center px-4 py-10 md:rounded-2xl md:py-4">
      <div className="bg-background rounded-2xl sm:min-h-[650px] sm:p-[32px] p-[16px] flex flex-col justify-between gap-[112px] w-full md:w-[40%] md:min-w-[490px]">
        <div className="flex flex-col gap-2">
          <Image
            className="rounded-2xl mb-3 md:hidden block" src="/assets/img/auction_bg.webp"
            height={390}
            width={690}
            alt="Auction Image"
          />
          <h3 className="font-optima text-3xl uppercase">Stasis</h3>
          <p className="text-sm">
            CryoDAO, HydraDAO, Tomorrow Bio, and Cryopets are partnering to develop the first purpose-built long-term cryopreservation facility and research lab in the United States. This facility builds on the success of the world’s first such site, the European Biostasis Foundation, opened in Switzerland in 2022. With a projected size of 8,000–9,000 sqft on a 2-acre plot, the facility will be designed for the safe, secure storage of 1,000–2,000 patients, with expansion capabilities.
          </p>
          <Link href="/@stasis" aria-label="View Auction" className="w-fit mt-2 text-base font-medium uppercase hover:underline">
            <div className="flex font-normal gap-3 items-center transition-[gap] duration-150 hover:gap-5">
              Go To Auction
              <ArrowRightIcon height={20} width={20} />
            </div>
          </Link>
        </div>



        <div className="bg-[#1F1F1F] p-[12px] rounded-2xl flex justify-between items-center">
          <div className="flex flex-col gap-4 ml-2">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl md:text-4xl font-semibold">27</h3>
                <p className="text-sm md:text-base font-light">DAYS</p>
              </div>
              <h3 className="text-3xl font-bold">:</h3>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl md:text-4xl font-semibold">08</h3>
                <p className="text-sm md:text-base font-light">HRS</p>
              </div>
              <h3 className="text-3xl font-bold">:</h3>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl md:text-4xl font-semibold">32</h3>
                <p className="text-sm md:text-base font-light">MINS</p>
              </div>
            </div>
            <p>left till auction closes</p>
          </div>

          <div className="bg-[#253031] rounded-2xl sm:h-[140px] sm:w-[140px] h-[110px] w-[110px] justify-center items-center flex">
            {/*<CircularGauge percentage={76} size={gaugeSize} strokeWidth={10} label="Funded" />*/}
            <div className="flex flex-col items-center gap-1 text-center">
              <h4 className="font-semibold flex items-center gap-2 text-xl sm:text-3xl">
                Ξ
                {projectVolume === undefined ? (<div className="activeSkeleton h-8 w-14 opacity-60 rounded-md" />) : (
                  <>
                    {projectVolume ? (Number(formatNumber(Number(formatUnits(projectVolume, 18)), true)).toFixed(2)) : ("—")}
                  </>
                )}
              </h4>
              <h5>RAISED</h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionComponent;