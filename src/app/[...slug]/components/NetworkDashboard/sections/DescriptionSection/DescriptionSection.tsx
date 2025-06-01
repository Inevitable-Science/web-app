"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify"
import { useJBProjectMetadataContext } from "juice-sdk-react";
import { DaoData } from "./TreasuryPreview";

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
  assetsUnderManagement: string;
}

interface DescriptionSectionProps {
  data: DaoData | null; // or undefined if it's not guaranteed to be passed yet
}

export function DescriptionSection({ data }: DescriptionSectionProps) {
  const { metadata } = useJBProjectMetadataContext();

  const { description } = metadata?.data ?? {};

  return (
      <div className="mt-2 text-sm">
        <RichPreview source={description || ""} />
         
        <DaoData data={data} />
      </div>
  );
}
