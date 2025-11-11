"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import StaticVolumeChart from "../../ActivityGraph";
import { ProjectDocument } from "@/generated/graphql";
import {
  useJBChainId,
  useJBContractContext,
  useBendystrawQuery,
} from "juice-sdk-react";

interface ChartSection {
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export function ChartSection({ setSelectedTab }: ChartSection) {
  const chainId = useJBChainId();
  const { projectId, version } = useJBContractContext();

  const { data: project } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version: Number(version),
    skip: !chainId || !projectId || !version,
  });
  const suckerGroupId = project?.project?.suckerGroupId;

  return (
    <section className="flex flex-col rounded-2xl bg-grey-450 p-[16px]">
      <StaticVolumeChart suckerGroupId={suckerGroupId} />

      <Button
        onClick={() => setSelectedTab("activity")}
        variant="link"
        className="mt-2 flex h-6 w-fit items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
      >
        Activity
        <ArrowRightIcon height="20" width="20" />
      </Button>
    </section>
  );
};
