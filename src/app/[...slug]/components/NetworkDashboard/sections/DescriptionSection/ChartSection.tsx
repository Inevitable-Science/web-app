'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import StaticVolumeChart from "../../Components/ActivityGraph";
import { useBendystrawQuery } from '@/graphql/useBendystrawQuery';
import { ProjectDocument } from '@/generated/graphql';
import { useJBChainId, useJBContractContext } from 'juice-sdk-react';

type ProjectTimelinePoint = {
  timestamp: number
  volume: number
  balance: number
  trendingScore: number
}

const sampleData: ProjectTimelinePoint[] = [
  { timestamp: Math.floor(Date.now() / 1000) - 30 * 24 * 3600, volume: 5, balance: 10, trendingScore: 200 },
  { timestamp: Math.floor(Date.now() / 1000) - 25 * 24 * 3600, volume: 7, balance: 12, trendingScore: 250 },
  { timestamp: Math.floor(Date.now() / 1000) - 20 * 24 * 3600, volume: 10, balance: 15, trendingScore: 300 },
  { timestamp: Math.floor(Date.now() / 1000) - 15 * 24 * 3600, volume: 8, balance: 13, trendingScore: 280 },
  { timestamp: Math.floor(Date.now() / 1000) - 10 * 24 * 3600, volume: 12, balance: 18, trendingScore: 320 },
  { timestamp: Math.floor(Date.now() / 1000) - 5 * 24 * 3600, volume: 15, balance: 20, trendingScore: 350 },
  { timestamp: Math.floor(Date.now() / 1000), volume: 18, balance: 22, trendingScore: 400 },
]


interface ChartSection {
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export const ChartSection: FC<ChartSection> = ({ setSelectedTab }) => {
  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();

  const { data: project } = useBendystrawQuery(ProjectDocument, {
      chainId: Number(chainId),
      projectId: Number(projectId),
      skip: !chainId || !projectId,
    });
    const suckerGroupId = project?.project?.suckerGroupId;

  return (
    <section className="flex flex-col mt-6 bg-grey-450 p-[16px] rounded-2xl">
      <StaticVolumeChart
                suckerGroupId={suckerGroupId}
              />
      
      <Button 
        onClick={() => setSelectedTab("activity")}
        variant="link" 
        className="h-6 w-fit pl-2 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
      >
        Activity
        <ArrowRightIcon height="20" width="20" />
      </Button>
    </section>
  );
};