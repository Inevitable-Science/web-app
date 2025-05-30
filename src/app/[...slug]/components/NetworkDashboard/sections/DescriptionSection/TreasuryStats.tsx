// DaoData.tsx
'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface DaoData {
  treasuryHoldings: string;
  assetsUnderManagement: string;
}

interface DaoDataProps {
  daoName: string;
}

function formatNumber(num: number) {
  return Math.round(num).toLocaleString();
}

export const DaoData: FC<DaoDataProps> = ({ daoName }) => {
  const [data, setData] = useState<DaoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://api.profiler.bio/api/dao/${daoName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch DAO data');
        }
        
        const result = await response.json();
        setData({
          treasuryHoldings: result.treasuryHoldings,
          assetsUnderManagement: result.assetsUnderManagement,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [daoName]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="bg-grey-450 p-[12px] rounded-2xl">
      <div className="grid grid-cols-2 gap-3">
        <div className="background-color p-[16px] rounded-2xl">
          <h4 className="text-xl mb-0.5 tracking-wider">${formatNumber(Number(data.treasuryHoldings))}</h4>
          <p className="text-muted-foreground font-light uppercase">Treasury Holdings</p>
        </div>
        <div className="background-color p-[16px] rounded-2xl">
          <h4 className="text-xl mb-0.5 tracking-wider">${formatNumber(Number(data.assetsUnderManagement))}</h4>
          <p className="text-muted-foreground font-light uppercase">Assets Under Management</p>
        </div>
      </div>

      <Button variant="link" className="uppercase">
        Treasury Stats
      </Button>
    </div>
  );
};