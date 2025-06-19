// src/components/NetworkDashboard/Components/ActivityGraph.tsx

import { CSSProperties, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import { useVolumeData } from '@/hooks/useVolumeData'; // 1. Import the data hook
import { formatEther } from 'viem';

// Export types for clarity and potential external use
export type ProjectTimelinePoint = {
  timestamp: number;
  volume: number;
  balance: number;
  trendingScore: number;
};
export type ProjectTimelineView = 'volume' | 'balance' | 'trendingScore';
export type ProjectTimelineRange = 7 | 30 | 365;

/**
 * A self-contained, reusable chart component that fetches and displays its own data.
 * It only requires a `suckerGroupId` to function.
 */
export default function ActivityGraph({
  suckerGroupId,
  height = 300,
}: {
  suckerGroupId: string | undefined;
  height?: CSSProperties['height'];
}) {
  // 2. Internal state management for the chart's UI controls
  const [view, setView] = useState<ProjectTimelineView>('volume');
  const [range, setRange] = useState<ProjectTimelineRange>(30);

  // 3. Internal data fetching logic
  const loadTimestamp = useMemo(() => Math.floor(Date.now() / 1000), [range]); // Recalculate when range changes to force refetch
  const startTimestamp = useMemo(() => loadTimestamp - range * 24 * 60 * 60, [loadTimestamp, range]);

  const { dailyTotals, isLoading } = useVolumeData({
    suckerGroupId,
    startTimestamp,
    endTimestamp: loadTimestamp,
  });

  // --- FIX: Replace this data formatting logic ---
  const data = useMemo(() => {
    // 1. Create a lookup map from the sparse data for efficient access.
    // The key will be a 'YYYY-MM-DD' string.
    const volumeMap = new Map<string, number>();
    dailyTotals.forEach(day => {
      // Normalize the date to a string key to avoid timezone issues.
      const dateKey = day.date.toISOString().split('T')[0];
      volumeMap.set(dateKey, Number(formatEther(day.volume)));
    });

    const fullData: ProjectTimelinePoint[] = [];

    let initialCumulativeVolume = dailyTotals
    .filter(day => day.date.getTime() < startTimestamp)
    .reduce((sum, day) => sum + Number(formatEther(day.volume)), 0);
    
    // 2. Loop through every day in the selected date range.
    for (let i = 0; i <= range; i++) {
      const currentDate = new Date(startTimestamp * 1000);
      currentDate.setUTCDate(currentDate.getUTCDate() + i);

      // Ensure we don't generate points for future dates
      if (currentDate.getTime() > loadTimestamp * 1000) {
        break;
      }

      const dateKey = currentDate.toISOString().split('T')[0];
      
      // 3. Get the volume from our map, or default to 0 if it doesn't exist.
      const volume = volumeMap.get(dateKey) || 0;

      initialCumulativeVolume += volume;

      fullData.push({
        timestamp: Math.floor(currentDate.getTime() / 1000),
        volume: initialCumulativeVolume,
        balance: 0, // Placeholder
        trendingScore: 0, // Placeholder
      });
    }

    return fullData;
  }, [dailyTotals, range, startTimestamp, loadTimestamp]);


  // --- All chart rendering logic from here down is mostly unchanged ---
  
  const colors = {
    grey: { 400: '#7B7B7B', 500: '#6b7280' },
    primary: { 400: '#FBE8BD' },
    smoke: { 100: '#f5f5f5' },
  };

  const stroke = colors.grey[400];
  const color = colors.grey[400];
  const bg = 'var(--grey-450)';
  const fontSize = '0.65rem';
  const highTrendingScore = 1000;

  const defaultYDomain = useMemo((): [number, number] => {
    if (data.length === 0) return [0, 100];
    const values = data.map(p => p[view]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [
      Number.isFinite(min) ? Math.floor(min * 0.95) : 0,
      Number.isFinite(max) ? Math.ceil(max * 1.05) : 100,
    ];
  }, [data, view]);

  const yDomain: [number, number] =
    view === 'trendingScore' && highTrendingScore
      ? [defaultYDomain[0], Math.max(highTrendingScore, defaultYDomain[1]) * 1.05]
      : defaultYDomain;

  const now = Date.now().valueOf();
  const daysToMS = (days: number) => days * 24 * 60 * 60 * 1000;
  const xDomain = useMemo(
    () => [ Math.floor((now - daysToMS(range)) / 1000), Math.floor(now / 1000) ] as [number, number],
    [range, now]
  );

  const generateTicks = (range: [number, number], resolution: number) => {
    const [min, max] = range;
    if (min === max) return [min];
    const step = (max - min) / resolution;
    return Array.from({ length: resolution + 1 }, (_, i) => Math.round(min + i * step));
  };

  const xTicks = generateTicks(xDomain, 7);
  const yTicks = generateTicks(yDomain, 5);

  const dateStringForBlockTime = (timestampSecs: number) => {
    const date = new Date(timestampSecs * 1000);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between activityGraphHeader">
        <div className="flex gap-3">
          {['volume', 'trendingScore'].map((v) => (
            <div
              key={v}
              className={twMerge(
                'cursor-pointer text-sm border-b pb-2 px-2',
                v === view ? 'font-medium border-primary' : 'font-light text-muted-foreground border-transparent'
              )}
              // 5. Connect UI controls to internal state setters
              onClick={() => setView(v as ProjectTimelineView)}
            >
              {v === 'volume' && 'Volume'}
              {v === 'trendingScore' && 'Trending'}
            </div>
          ))}
        </div>

        <Select
          value={String(range)}
          onValueChange={(value) => {
            setRange(Number(value) as ProjectTimelineRange);
          }}
        >
          <SelectTrigger className="w-[5.6rem] h-fit rounded border-none background-color rounded-full px-2 text-xs uppercase text-muted-foreground hover:text-foreground">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height={height}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-grey-400">
                <Loader2 className="animate-spin" size={32} />
              </div>
            </div>
          ) : (
            <LineChart margin={{ top: 5, right: 20, bottom: 5, left: 20 }} data={data}>
              <CartesianGrid stroke={stroke} strokeDasharray="1 2" vertical={false} />
              <YAxis
                stroke={stroke}
                tickLine={false}
                tickSize={0}
                tick={(props) => {
                  if (view === 'trendingScore' || !data.length) return <g></g>;
                  const { value } = props.payload;
                  const formattedValue = value.toFixed(value >= 10 ? 0 : 1);
                  return (
                    <g>
                      <rect
                        transform={`translate(${props.x},${props.y - 6})`}
                        height={12}
                        width={formattedValue.length > 2 ? 40 : 30}
                        fill={bg}
                      />
                      <text
                        x={-4} 
                        y={-8}
                        fontSize={fontSize}
                        fill={color}
                        transform={`translate(${props.x + 4},${props.y + 4})`}
                      >
                        Ξ{formattedValue}
                      </text>
                    </g>
                  );
                }}
                ticks={yTicks}
                domain={yDomain}
                interval={0}
                mirror
              />
              <XAxis
                stroke={stroke}
                tick={(props) => (
                  <text
                    fontSize={fontSize}
                    fill={color}
                    transform={`translate(${props.x - 12},${props.y + 14})`}
                  >
                    {dateStringForBlockTime(props.payload.value)}
                  </text>
                )}
                ticks={xTicks}
                domain={xDomain}
                interval={0}
                tickLine={false}
                tickSize={0}
                type="number"
                dataKey="timestamp"
                scale="time"
              />
              {view === 'trendingScore' && highTrendingScore && data.length > 0 && (
                <ReferenceLine
                  label={<Label fill={color} style={{ fontSize, fontWeight: 500 }} position="insideTopLeft" offset={8} value="Current #1 trending" />}
                  stroke={color}
                  y={highTrendingScore}
                />
              )}
              {data.length > 0 && (
                <Line
                  dot={false}
                  stroke={colors.primary[400]}
                  strokeWidth={2}
                  type="monotone"
                  dataKey={view}
                  activeDot={{ r: 6, fill: colors.primary[400], stroke: undefined }}
                  animationDuration={750}
                />
              )}
              <Tooltip
                cursor={{ stroke: color }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as ProjectTimelinePoint;
                  const amount = point[view];
                  return (
                    <div className="rounded bg-transparent p-2 text-sm">
                      <div className="text-grey-400">{dateStringForBlockTime(point.timestamp)}</div>
                      {view !== 'trendingScore' && (
                        <div className="font-medium">
                          Ξ{amount.toFixed(amount > 10 ? 1 : amount > 1 ? 2 : 4)}
                        </div>
                      )}
                    </div>
                  );
                }}
                animationDuration={50}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <style>{`
      @media (max-width:330px){
        .activityGraphHeader{
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
      }
      `}</style>
    </div>
  );
}