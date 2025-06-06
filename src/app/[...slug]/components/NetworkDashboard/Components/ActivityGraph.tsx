import { CSSProperties, useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from 'recharts'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { twMerge } from 'tailwind-merge'

// Static data type for the chart
type ProjectTimelinePoint = {
  timestamp: number
  volume: number
  balance: number
  trendingScore: number
}

type ProjectTimelineView = 'volume' | 'balance' | 'trendingScore'
type ProjectTimelineRange = 7 | 30 | 365

// DATA_TODO: Add functionality to this graph

// Static chart component
export default function StaticVolumeChart({
  height = 300,
  data,
  view = 'volume',
  range = 30,
}: {
  height?: CSSProperties['height']
  data: ProjectTimelinePoint[]
  view?: ProjectTimelineView
  range?: ProjectTimelineRange
}) {
  // Static theme colors for single theme (light theme)
  const colors = {
    grey: {
      400: '#7B7B7B',
      500: '#6b7280',
    },
    primary: {
      400: '#FBE8BD',
    },
    smoke: {
      100: '#f5f5f5',
    },
  }

  // Hardcoded styles for single theme
  const stroke = colors.grey[400]
  const color = colors.grey[400]
  const bg = 'var(--grey-450)'
  const fontSize = '0.75rem'

  // Static high trending score for reference line (adjust as needed)
  const highTrendingScore = 1000

  // Calculate Y-axis domain
  const defaultYDomain = useMemo((): [number, number] => {
    const values = data.map(p => p[view])
    if (values.length === 0) return [0, 100] // Fallback for empty data
    const min = Math.min(...values)
    const max = Math.max(...values)
    // Ensure valid numbers, fallback to [0, 100] if min/max are invalid
    return [
      Number.isFinite(min) ? Math.floor(min * 0.95) : 0,
      Number.isFinite(max) ? Math.ceil(max * 1.05) : 100,
    ] as [number, number] // Explicit tuple type cast
  }, [data, view])

  const yDomain: [number, number] =
    view === 'trendingScore' && highTrendingScore
      ? [defaultYDomain[0], Math.max(highTrendingScore, defaultYDomain[1]) * 1.05]
      : defaultYDomain

  // Calculate X-axis domain based on range
  const now = Date.now().valueOf()
  const daysToMS = (days: number) => days * 24 * 60 * 60 * 1000
  const xDomain = useMemo(
    () =>
      [
        Math.floor((now - daysToMS(range)) / 1000),
        Math.floor(now / 1000),
      ] as [number, number],
    [range]
  )

  // Generate ticks for X and Y axes
  const generateTicks = (range: [number, number], resolution: number) => {
    const [min, max] = range
    const step = (max - min) / resolution
    return Array.from({ length: resolution + 1 }, (_, i) =>
      Math.round(min + i * step)
    )
  }

  const xTicks = generateTicks(xDomain, 7)
  const yTicks = generateTicks(yDomain, 5)

  // Format timestamp to M/DD using native Date
  const dateStringForBlockTime = (timestampSecs: number) => {
    const date = new Date(timestampSecs * 1000)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div>
      {/* View and Range Selectors */}
      <div className="mb-4 flex items-baseline justify-between">
        {/* View Selector (Desktop-style tabs) */}
        <div className="flex gap-3">
          {['volume', 'trendingScore'].map((v) => (
            <div
              key={v}
              className={twMerge(
                'cursor-pointer text-sm border-b pb-2 px-2',
                v === view
                  ? 'font-medium border-primary'
                  : 'font-light text-muted-foreground border-transparent'
              )}
              onClick={() => console.log(`Switch to view: ${v}`)} // Replace with state handler if needed
            >
              {v === 'volume' && 'Volume'}
              {v === 'trendingScore' && 'Trending'}
            </div>
          ))}
        </div>

        {/* Range Selector (Dropdown style) */}
        <Select
          value={String(range)}
          onValueChange={(value) => {
            const numericValue = Number(value);
            console.log(`Switch to range: ${numericValue}`);
          }}
        >
          <SelectTrigger className="w-[5.6rem] h-fit rounded border-none background-color rounded-full px-2 text-xs uppercase text-muted-foreground hover:text-foreground">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Chart */}
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            margin={{
              top: -1,
              right: 0,
              bottom: 0,
              left: 1,
            }}
            data={data}
          >
            <CartesianGrid stroke={stroke} strokeDasharray="1 2" vertical={false} />
            <YAxis
              stroke={stroke}
              tickLine={false}
              tickSize={0}
              tick={(props) => {
                if (view === 'trendingScore' || !data.length) return <g></g>
                const { value } = props.payload
                const formattedValue = value.toFixed(value >= 10 ? 0 : 1)
                return (
                  <g>
                    <rect
                      transform={`translate(${props.x},${props.y - 6})`}
                      height={12}
                      width={formattedValue.length > 2 ? 40 : 30}
                      fill={bg}
                    />
                    <text
                      fontSize={fontSize}
                      fill={color}
                      transform={`translate(${props.x + 4},${props.y + 4})`}
                    >
                      Ξ{formattedValue}
                    </text>
                  </g>
                )
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
            {view === 'trendingScore' && highTrendingScore && data.length && (
              <ReferenceLine
                label={
                  <Label
                    fill={color}
                    style={{ fontSize, fontWeight: 500 }}
                    position="insideTopLeft"
                    offset={8}
                    value="Current #1 trending"
                  />
                }
                stroke={color}
                y={highTrendingScore}
              />
            )}
            {data.length && (
              <Line
                dot={false}
                stroke={colors.primary[400]}
                strokeWidth={4}
                type="monotone"
                dataKey={view}
                activeDot={{ r: 6, fill: colors.primary[400], stroke: undefined }}
                animationDuration={750}
              />
            )}
            <Tooltip
              cursor={{ stroke: color }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const amount = payload[0].payload[view]
                return (
                  <div className="rounded bg-transparent p-2 text-sm">
                    <div className="text-grey-400">
                      {dateStringForBlockTime(payload[0].payload.timestamp)}
                    </div>
                    {view !== 'trendingScore' && (
                      <div className="font-medium">
                        Ξ{amount.toFixed(amount > 10 ? 1 : amount > 1 ? 2 : 4)}
                      </div>
                    )}
                  </div>
                )
              }}
              animationDuration={50}
            />
          </LineChart>
        </ResponsiveContainer>
        {!data.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-grey-400">No data available</div>
          </div>
        )}
      </div>
    </div>
  )
}