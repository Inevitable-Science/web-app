'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import StaticVolumeChart from "../../Components/ActivityGraph";
import { useBendystrawQuery } from '@/graphql/useBendystrawQuery';
import { ProjectDocument } from '@/generated/graphql';
import { useJBChainId, useJBContractContext } from 'juice-sdk-react';

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
    <section className="flex flex-col bg-grey-450 p-[16px] rounded-2xl">
      <StaticVolumeChart
        suckerGroupId={suckerGroupId}
      />
      
      <Button 
        onClick={() => setSelectedTab("activity")}
        variant="link" 
        className="h-6 mt-2 w-fit pl-2 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
      >
        Activity
        <ArrowRightIcon height="20" width="20" />
      </Button>
    </section>
  );
};