"use client";

import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ActivityEventsTable } from "./ActivityEventsTable";
import StaticVolumeChart from "../components/ActivityGraph";

export function ActivityFeed() {
  const project = useRevnetDataStore((state) => state.project);
  const suckerGroupId = project.suckerGroupId;

  return (
    <>
      <section className="bg-grey-450 mb-6 flex flex-col rounded-2xl p-[16px]">
        <StaticVolumeChart suckerGroupId={suckerGroupId} />
      </section>

      <ActivityEventsTable />
    </>
  );
}
