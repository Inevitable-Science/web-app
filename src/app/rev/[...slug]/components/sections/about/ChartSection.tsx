"use client";

import { Button } from "@/components/ui/button";
import StaticVolumeChart from "../../ActivityGraph";
import { ProjectDocument } from "@/generated/graphql";
import {
  useJBChainId,
  useJBContractContext,
  useBendystrawQuery,
} from "juice-sdk-react";
import { ArrowRight } from "lucide-react";
import { useProjectDataStore } from "../../../ProjectDataContext";

export function ChartSection() {
  const { projectId, version } = useJBContractContext();
  const setSelectedTab = useProjectDataStore((state) => state.setSelectedTab);
  const chainId = useJBChainId();

  const { data: project } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version: Number(version),
    skip: !chainId || !projectId || !version,
  });
  const suckerGroupId = project?.project?.suckerGroupId;

  return (
    <section className="bg-grey-450 flex flex-col rounded-2xl p-[16px]">
      <StaticVolumeChart suckerGroupId={suckerGroupId} />

      <Button
        onClick={() => setSelectedTab("activity")}
        variant="link"
        className="mt-2 flex h-6 w-fit items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
      >
        Activity
        <ArrowRight height="20" width="20" />
      </Button>
    </section>
  );
}
