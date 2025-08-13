"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify"
import { useJBProjectMetadataContext } from "juice-sdk-react";
import { DaoData } from "./AnalyticsPreview";
import { SocialLinks } from "./SocialLinks";
import { ChartSection } from "./ChartSection";

const RichPreview = ({ source }: { source: string }) => {
  useEffect(() => {
    DOMPurify.addHook("afterSanitizeAttributes", function (node) {
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
    // Convert markdown links [text](url) → <a href="url">text</a>
    const withLinks = source.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      "<a href=\"$2\">$1</a>"
    );

    // Sanitize the generated HTML
    const purified = DOMPurify.sanitize(withLinks);

    return (
      <div
        className="w-[calc(100vw-48px)] sm:w-full break-words [&_a]:break-all [&_a]:text-cerulean [&_a:hover]:underline"
        dangerouslySetInnerHTML={{
          __html: purified,
        }}
      />
    );
  } catch (error) {
    console.error("HTML sanitization failed:", error);
    return <div className="break-words">{source}</div>;
  }
};


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
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export function DescriptionSection({ setSelectedTab }: DescriptionSectionProps) {
  const { metadata } = useJBProjectMetadataContext();

  const { description, name } = metadata?.data ?? {};

  return (
      <div className="text-sm">
        <ChartSection setSelectedTab={setSelectedTab} />

        {/* TODO: No idea why this is showing a "0" when not loading. */}
        {/* {!analyticsError && data?.latestMarketCap && (
          <DaoData data={data} setSelectedTab={setSelectedTab} />
        )} */}

        <div className="mt-6">
          <RichPreview source={description || name || "..."} />
        </div>

        <SocialLinks {...metadata}/>
      </div>
  );
}