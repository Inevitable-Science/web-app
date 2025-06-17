"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { Participant } from "@/generated/graphql";
import { formatPortion } from "@/lib/utils";
import { JBChainId, JBProjectToken } from "juice-sdk-core";
import { useMemo, useState, useEffect } from "react";
import { Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { Address } from "viem";
import { UseTokenReturnType } from "wagmi";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const segmentColors = ["#315659", "#C6E0FF", "#2978A0", "#253031", "#FBE8BD"];

const MIN_PERCENT = 0.5;

interface PieChartData {
  address: Address;
  balanceFormatted: number;
  balance: JBProjectToken;
  fill: string;
  percent: string;
  visualValue: number;
}

interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: PieChartData;
  percent: number;
  value: number;
}

const renderActiveShape = (props: ActiveShapeProps): JSX.Element => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={"var(--foreground)"}>
        <tspan x={cx} dy="-0.5em" className="text-2xl">
          <EthereumAddress address={payload.address} short />
        </tspan>
        <tspan x={cx} dy="1.8em" className="text-sm">
          {/*{payload.balance.format()} tokens*/}
          {formatNumber(payload.balanceFormatted, true)} tokens
        </tspan>
        <tspan x={cx} dy="1.3em" className="text-sm">
          {/*{payload.percent}% of total supply*/}
          {formatNumber(Number(payload.percent))}% of total supply
        </tspan>
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export function ParticipantsPieChart({
  token,
  totalSupply,
  participants,
}: {
  token: UseTokenReturnType["data"] | null;
  totalSupply: bigint;
  participants: (Participant & { chains: JBChainId[] })[];
}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [radius, setRadius] = useState<{ innerRadius: number; outerRadius: number }>({
    innerRadius: 120,
    outerRadius: 150,
  });

  const pieChartData = useMemo(() => {
    const totalBalance = participants?.reduce(
      (acc, participant) => acc + BigInt(participant?.balance),
      BigInt(0)
    );

    return participants
      ?.map((participant, idx) => {
        const balance = new JBProjectToken(BigInt(participant?.balance));
        const percent = formatPortion(balance.value, totalSupply);
        const visualValue = Number(percent) < MIN_PERCENT ? MIN_PERCENT : Number(percent);

        return {
          address: participant?.address,
          balanceFormatted: balance.toFloat(),
          balance,
          fill: segmentColors[idx % segmentColors.length],
          percent,
          visualValue,
        };
      })
      .filter((item) => item.balanceFormatted > 0)
      .sort((a, b) => b.balanceFormatted - a.balanceFormatted);
  }, [participants, totalSupply]);

  useEffect(() => {
    setActiveIndex(0);
  }, [participants]);

  const adjustRadius = () => {
    const width = window.innerWidth;
    if (width < 410) {
      setRadius({ innerRadius: 100, outerRadius: 120 });
    } else {
      setRadius({ innerRadius: 120, outerRadius: 150 });
    }
  };

  useEffect(() => {
    adjustRadius();
    window.addEventListener("resize", adjustRadius);
    return () => {
      window.removeEventListener("resize", adjustRadius);
    };
  }, []);

  const totalBalance = participants?.reduce(
    (acc, participant) => acc + BigInt(participant?.balance),
    BigInt(0)
  );
  if (totalBalance === 0n || !pieChartData?.length) {
    return (
      <div className="tcpPieContainer">
        <Loader2 className="animate-spin" size={32} />
        <style>{`
          .tcpPieContainer {
            width: 100%;
            height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tcpPieContainer">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape as any}
            data={pieChartData}
            cx="50%"
            cy="50%"
            innerRadius={radius.innerRadius}
            outerRadius={radius.outerRadius}
            stroke="none"
            dataKey="visualValue"
            nameKey="address"
            isAnimationActive={false}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          />
        </PieChart>
      </ResponsiveContainer>

      <style>{`
        .tcpPieContainer {
          width: 100%;
          height: fit-content;
        }

        .recharts-pie * {
          outline: none !important;
        }

        .recharts-pie-sector:hover {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}