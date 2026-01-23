"use client";

import { Button } from "@/components/ui/button";
import StaticVolumeChart from "./components/ActivityGraph";
import { ProjectDocument } from "@/generated/graphql";
import {
  useJBChainId,
  useJBContractContext,
  useBendystrawQuery,
} from "juice-sdk-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

export function ChartSection() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();
  const slug = useRevnetDataStore(state => state.slug);

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

      <Link href={`/rev/${slug}/activity`}>
        <Button
          variant="link"
          className="mt-2 flex h-6 w-fit items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
        >
          Activity
          <ArrowRight height="20" width="20" />
        </Button>
      </Link>
    </section>
  );
}
