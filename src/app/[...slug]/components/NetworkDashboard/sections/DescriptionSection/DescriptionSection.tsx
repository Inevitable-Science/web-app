"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify"
import { useJBProjectMetadataContext } from "juice-sdk-react";
import { DaoData } from "./AnalyticsPreview";
import { SocialLinks } from "./SocialLinks";
import { ChartSection } from "./ChartSection";

const RichPreview = ({ source }: { source: string }) => {
  useEffect(() => {
    DOMPurify.addHook("afterSanitizeAttributes", function(node) {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
  }, []);

  if (!source?.trim()) {
    return null;
  }

  try {
    const purified = DOMPurify.sanitize(source)
    return (
      <div
        className="break-words [&_a]:text-cerulean [&_a:hover]:underline"
        dangerouslySetInnerHTML={{
          __html: purified,
        }}
      />
    )
  } catch (error) {
    console.error("HTML sanitization failed:", error)
    return <div className="break-words">{source}</div>
  }
}

interface DaoData {
  treasuryHoldings: string;
  assetsUnderManagement: string | number;
  totalHolders: string;
  totalSupply: string | number;
  latestPrice: number;
  latestMarketCap: number;
  tokenName: string;
}

interface DescriptionSectionProps {
  analyticsError: string | null;
  data: DaoData | null; // or undefined if it's not guaranteed to be passed yet
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export function DescriptionSection({ analyticsError, data, setSelectedTab }: DescriptionSectionProps) {
  const { metadata } = useJBProjectMetadataContext();

  useEffect(() => {
    console.log(analyticsError);
  }, [analyticsError])

  const { description, name } = metadata?.data ?? {};

  return (
      <div className="text-sm">
        <ChartSection setSelectedTab={setSelectedTab} /> {/* DATA_TODO: Add functionality to view changes to the project rules */}
      
        {!analyticsError && data && (
          <DaoData data={data} setSelectedTab={setSelectedTab} />
        )}

        <div className="mt-6">
          <RichPreview source={description || name || "..."} />
        </div>

        <SocialLinks {...metadata}/>
      </div>
  );
}