import { useMemo } from 'react';
import { useBendystrawQuery } from '@/graphql/useBendystrawQuery';
import { ParticipantSnapshotsInRangeDocument } from '@/generated/graphql';

// Define the shape of the data our hook will return
export type DailyVolume = {
  date: Date;
  volume: bigint;
};

// Define the props for our hook
type UseVolumeDataProps = {
  suckerGroupId: string | undefined;
  startTimestamp: number;
  endTimestamp: number;
};

/**
 * A reusable hook to fetch and process project volume data for a given date range.
 * @param suckerGroupId - The ID of the sucker group for the project.
 * @param startTimestamp - The beginning of the date range (Unix timestamp in seconds).
 * @param endTimestamp - The end of the date range (Unix timestamp in seconds).
 * @returns An object containing the processed daily volume data and a loading state.
 */
export function useVolumeData({ suckerGroupId, startTimestamp, endTimestamp }: UseVolumeDataProps) {
  // 1. Memoize the `where` clause to ensure the query is stable
  const whereClause = useMemo(() => ({
    suckerGroupId,
    timestamp_gt: startTimestamp,
    timestamp_lt: endTimestamp,
  }), [suckerGroupId, startTimestamp, endTimestamp]);

  // 2. Fetch all snapshots for the entire period in a single query
  const { data: snapshotData, isLoading } = useBendystrawQuery(
    ParticipantSnapshotsInRangeDocument,
    {
      where: whereClause,
      skip: !suckerGroupId,
    }
  );

  // 3. Process the raw data into daily totals. This only re-calculates when the data arrives.
  const dailyTotals: DailyVolume[] = useMemo(() => {
    if (isLoading || !snapshotData?.participantSnapshots) {
      return []; // Return empty array while loading or if there's no data
    }

    const items = snapshotData.participantSnapshots.items ?? [];
    
    // Use a Map to bucket transactions by day
    const volumeByDay = new Map<string, bigint>();

    for (const snapshot of items) {
      // Normalize the timestamp to the start of the day (in UTC)
      const day = new Date(snapshot.timestamp * 1000).toISOString().split('T')[0];
      
      const currentVolume = volumeByDay.get(day) ?? 0n;
      volumeByDay.set(day, currentVolume + BigInt(snapshot.volume));
    }

    // Convert the map to the desired array structure and sort it
    return Array.from(volumeByDay.entries())
      .map(([day, volume]) => ({
        date: new Date(day),
        volume,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  }, [snapshotData, isLoading]);

  return { dailyTotals, isLoading };
}