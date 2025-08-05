'use client';

import React, { useState, useEffect, type JSX } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';

interface TreasuryToken {
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contractAddress: string | null;
  rawBalance: string;
  decodedBalance: number;
  price: number;
  totalValue: number;
  _id?: string;
}

interface TreasuryPieChartProps {
  filteredData: TreasuryToken[];
}

const MIN_PERCENT = 0.5;

const segmentColors = [
  '#315659',
  '#C6E0FF',
  '#2978A0',
  '#253031',
  '#FBE8BD',
];

interface PieChartData extends TreasuryToken {
  value: number;
  percent: string;
  visualValue: number;
  fill: string;
}

// Props for renderActiveShape
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
  const textAnchor = cos >= 0 ? 'start' : 'end';

  function formatNumber(value: number | string) {
    if (value === 'N/A') return value;
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) {
      return 'N/A';
    }

    const fractionDigits = number < 10 ? 2 : 0;

    return number.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }

  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={'var(--foreground)'}>
        {payload.contractAddress ? (
          <a
            href={`https://etherscan.io/token/${payload.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-4xl hover:underline"
          >
            <tspan x={cx} dy="0">{payload.metadata.symbol}</tspan>
          </a>
        ) : (
          <tspan x={cx} dy="0" className="text-4xl">
            {payload.metadata.symbol}
          </tspan>
        )}
        <tspan x={cx} dy="1.8em" className="text-sm">
          1 {payload.metadata.name} = ${formatNumber(payload.price)} USD
        </tspan>
        <tspan x={cx} dy="1.3em" className="text-sm">
          {formatNumber(payload.decodedBalance)} {payload.metadata.symbol}
        </tspan>
        <tspan x={cx} dy="1.3em" className="text-sm">${formatNumber(payload.totalValue)}</tspan>
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

const TreasuryPieChart: React.FC<TreasuryPieChartProps> = ({ filteredData }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [radius, setRadius] = useState<{ innerRadius: number; outerRadius: number }>({
    innerRadius: 120,
    outerRadius: 150,
  });


  const totalValue = filteredData.reduce((sum, token) => {
    const value = token.totalValue || 0;
    return sum + (isNaN(value) ? 0 : value);
  }, 0);


  const adjustedData: PieChartData[] = totalValue > 0
    ? filteredData
        .map((token) => ({
          ...token,
          value: token.totalValue || 0,
        }))
        .filter((token) => token.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((token, index) => {
          const percent = (token.value / totalValue) * 100;
          return {
            ...token,
            percent: isNaN(percent) ? '0.00' : percent.toFixed(2),
            visualValue: isNaN(percent) || percent < MIN_PERCENT ? MIN_PERCENT : percent,
            fill: segmentColors[index % segmentColors.length],
          };
        })
    : [];


    useEffect(() => {
    setActiveIndex(0);
  }, [filteredData]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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
    window.addEventListener('resize', adjustRadius);
    return () => {
      window.removeEventListener('resize', adjustRadius);
    };
  }, []);


  if (!adjustedData.length) {
    return (
      <div className="tcpPieContainer">
        <p>No valid data to display</p>
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
            isAnimationActive={false}
            activeShape={renderActiveShape as any}
            data={adjustedData}
            cx="50%"
            cy="50%"
            innerRadius={radius.innerRadius}
            outerRadius={radius.outerRadius}
            stroke="none"
            dataKey="visualValue"
            onMouseEnter={onPieEnter}
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
};

export default TreasuryPieChart;