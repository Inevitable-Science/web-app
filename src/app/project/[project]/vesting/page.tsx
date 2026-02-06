import { formatEther, getContract } from "viem";
import { SchedulesSection } from "./SchedulesSection";
import { vestingContracts } from "@/lib/vesting/constants";
import { notFound } from "next/navigation";
import { vestingAbi } from "@/lib/vesting/vestingAbi";
import { getViemPublicClient } from "@/lib/wagmiConfig";
import {
  ProcessedSchedule,
  ScheduleSchemaZ,
  ScheduleType,
} from "@/lib/vesting/types";
import { formatNumber } from "@/lib/utils";

export const revalidate = 900; // 15 mins

// A bit weird but much faster using multicalls over for loops iterating through promises

export default async function ProjectVestingPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;

  const vestingContractObj = vestingContracts.find(
    (d) => project.toLowerCase() === d.name
  );
  if (!vestingContractObj) return notFound();

  const client = getViemPublicClient(vestingContractObj.vestingContractChainId);
  const vestingContract = getContract({
    address: vestingContractObj.vestingContract,
    abi: vestingAbi,
    client,
  });

  let schedules: ProcessedSchedule[] = [];
  let totalReleasableTokens: bigint = BigInt(0);
  let totalReleasedTokens: bigint = BigInt(0);
  let numRevokedSchedules = 0;

  const [totalLockedTokens, scheduleIds] = await Promise.all([
    vestingContract.read.totalSupply(),
    vestingContract.read.getVestingSchedulesIds(),
  ]);

  const batchSchedules = await client.multicall({
    contracts: scheduleIds.map((id) => ({
      address: vestingContractObj.vestingContract,
      abi: vestingAbi,
      functionName: "getVestingSchedule",
      args: [id],
    })),
  });

  // the batchSchedules multicall doesn't return schedule ID
  // but the schedule matches with the position within the array
  // this loop validates the validity of data and response.
  const schedulesWithId: ScheduleType[] = []; // temp array for holding unprocessed schedules
  for (let i = 0; i < batchSchedules.length; i++) {
    const res = batchSchedules[i];

    if (res.status !== "success" || typeof res.result !== "object") continue;
    const scheduleObj = {
      id: scheduleIds[i],
      ...res.result,
    };

    const parsed = ScheduleSchemaZ.safeParse(scheduleObj);
    console.log(scheduleObj);
    if (!parsed.success) continue;

    const parsedSchedule = parsed.data;
    totalReleasedTokens += parsedSchedule.released;
    schedulesWithId.push(parsed.data);

    // extra logic, if the schedule is revoked push it to the
    // schedule array early
    if (parsedSchedule.status !== 0) {
      schedules.push({
        ...parsedSchedule,
        releasableAmount: BigInt(0),
      });
    }
  }

  const unrevokedSchedules = schedulesWithId.filter(
    (schedule) => schedule.status == 0
  );
  numRevokedSchedules = schedulesWithId.length - unrevokedSchedules.length;

  const batchReleasableAmount = await client.multicall({
    contracts: unrevokedSchedules.map((schedule) => ({
      address: vestingContractObj.vestingContract,
      abi: vestingAbi,
      functionName: "computeReleasableAmount",
      args: [schedule.id],
    })),
  });

  for (let i = 0; i < batchReleasableAmount.length; i++) {
    const r = batchReleasableAmount[i];
    if (r.status !== "success") continue;

    const released = r.result as bigint;
    totalReleasableTokens += released;

    schedules.push({
      ...unrevokedSchedules[i],
      //id: unrevokedSchedules[i].id,
      releasableAmount: released,
    });
  }

  return (
    <div>
      <div className="bg-grey-450 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3 rounded-2xl p-[12px]">
        <div className="background-color rounded-xl p-[16px]">
          <h3 className="text-xl">
            {formatNumber(formatEther(totalLockedTokens))}
          </h3>
          <p className="text-muted-foreground font-light uppercase">
            Locked Tokens
          </p>
        </div>

        <div className="background-color rounded-xl p-[16px]">
          <h3 className="text-xl">{scheduleIds.length}</h3>
          <p className="text-muted-foreground font-light uppercase">
            Schedules{" "}
            {numRevokedSchedules !== 0 && `(${numRevokedSchedules} revoked)`}
          </p>
        </div>

        <div className="background-color rounded-xl p-[16px]">
          <h3 className="text-xl">
            {formatNumber(formatEther(totalReleasableTokens))}
          </h3>
          <p className="text-muted-foreground font-light uppercase">
            Releasable Tokens
          </p>
        </div>

        <div className="background-color rounded-xl p-[16px]">
          <h3 className="text-xl">
            {formatNumber(formatEther(totalReleasedTokens))}
          </h3>
          <p className="text-muted-foreground font-light uppercase">
            Claimed Tokens
          </p>
        </div>
      </div>

      <SchedulesSection schedules={schedules} />
    </div>
  );
}
