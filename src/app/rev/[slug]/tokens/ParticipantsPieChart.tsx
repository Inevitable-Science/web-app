"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { ParticipantsDocument } from "@/generated/graphql";
import { formatPortion } from "@/lib/utils";
import { JB_CHAINS, JBChainId, JBProjectToken } from "juice-sdk-core";
import { useMemo, useState, useEffect, type JSX } from "react";
import { Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { Address } from "viem";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useBendystrawQuery } from "juice-sdk-react";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";

const segmentColors = ["#315659", "#C6E0FF", "#253031", "#FBE8BD"];

const MIN_PERCENT = 0.5;

interface PieChartData {
  address: Address;
  balanceFormatted: number;
  balance: JBProjectToken;
  chainId: JBChainId;
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
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;
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
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={"#ffffff"}>
        <tspan x={cx} fill={"#ffffff"} dy="-0.5em" className="text-2xl">
          {payload.address.endsWith("Others") ? (
            <tspan className="fill-white">{payload.address}</tspan>
          ) : (
            <EthereumAddress
              className="fill-white"
              address={payload.address}
              chain={JB_CHAINS[payload.chainId].chain}
              short
            />
          )}
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

export function ParticipantsPieChart() {
  const project = useRevnetDataStore((state) => state.project);
  const totalSupply = useTotalOutstandingTokens();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [radius, setRadius] = useState<{
    innerRadius: number;
    outerRadius: number;
  }>({
    innerRadius: 120,
    outerRadius: 150,
  });

  const holdersLimit = 10;

  const { data: participantsQuery, isLoading } = useBendystrawQuery(
    ParticipantsDocument,
    {
      orderBy: "balance",
      orderDirection: "desc",
      where: {
        suckerGroupId: project.suckerGroupId,
        balance_gt: 0,
      },
      limit: holdersLimit,
    }
  );

  const participantsDataAggregate =
    participantsQuery?.participants.items?.reduce(
      (acc, participant) => {
        if (!participant) return acc;
        const existingParticipant = acc[participant.address];
        return {
          ...acc,
          [participant.address]: {
            address: participant.address,
            balance:
              BigInt(existingParticipant?.balance ?? 0) +
              BigInt(participant.balance ?? 0),
            volume:
              BigInt(existingParticipant?.volume ?? 0) +
              BigInt(participant.volume ?? 0),
            chains: [
              ...(acc[participant.address]?.chains ?? []),
              participant.chainId,
            ],
          },
        };
      },
      {} as Record<string, any>
    ) ?? {};

  const participants = Object.values(participantsDataAggregate);

  const totalBalanceFromQuery = participants?.reduce(
    (acc, participant) => acc + BigInt(participant?.balance),
    BigInt(0)
  );

  const totalHolders = participantsQuery?.participants.totalCount ?? 0;
  const extraHolders = totalHolders - holdersLimit;
  const otherHoldersSupply = totalSupply - totalBalanceFromQuery;

  const constructedObj = {
    address: `${extraHolders} Others`,
    balance: otherHoldersSupply,
    volume: 0n,
    chains: [1],
    denotesExtraHolders: true,
  };

  if (extraHolders > 0) {
    participants.push(constructedObj);
  }

  const pieChartData = useMemo(() => {
    return (
      participants
        ?.map((participant, idx) => {
          const balance = new JBProjectToken(BigInt(participant?.balance));
          const percent = formatPortion(balance.value, totalSupply);
          const visualValue =
            Number(percent) < MIN_PERCENT ? MIN_PERCENT : Number(percent);

          return {
            address: participant?.address,
            balanceFormatted: balance.toFloat(),
            balance,
            chainId: participant.chains[0],
            fill: segmentColors[idx % segmentColors.length],
            percent,
            visualValue,
            denotesExtraHolders: participant.denotesExtraHolders ?? undefined,
          };
        })
        .filter((item) => item.balanceFormatted > 0)
        //.sort((a, b) => b.balanceFormatted - a.balanceFormatted);
        .sort((a, b) => {
          // Always move "extra holders" to the end
          if (a.denotesExtraHolders && !b.denotesExtraHolders) return 1;
          if (!a.denotesExtraHolders && b.denotesExtraHolders) return -1;

          // Otherwise sort by balance
          return b.balanceFormatted - a.balanceFormatted;
        })
    );
  }, [participants, totalSupply]);

  useEffect(() => {
    const adjustRadius = () => {
      const width = window.innerWidth;
      if (width < 410) {
        setRadius({ innerRadius: 100, outerRadius: 120 });
      } else {
        setRadius({ innerRadius: 120, outerRadius: 150 });
      }
    };

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

  if (totalBalance === 0n || !pieChartData?.length || isLoading) {
    return (
      <div className="participantsPieContainer">
        <Loader2 className="animate-spin" size={32} />
        <style>{`
          .participantsPieContainer {
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
    <div className="participantsPieContainer">
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
        .participantsPieContainer {
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
