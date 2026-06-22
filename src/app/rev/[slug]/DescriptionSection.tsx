"use client";

import { useEffect } from "react";
import DOMPurify from "dompurify";
import { DaoData } from "./AnalyticsPreview";
import { SocialLinks } from "./SocialLinks";
import { ChartSection } from "./ChartSection";
import { useJBProjectMetadataContext } from "juice-sdk-react";
import { LoansTable } from "./components/loanActions/LoansTable";
import { EditMetadataDialog } from "./components/EditMetadataDialog";
import { useUserPermissions } from "@/hooks/useUserPermissions";

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

  // Convert markdown links [text](url) → <a href="url">text</a>
  const withLinks = source.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  // Sanitize the generated HTML
  const purified = DOMPurify.sanitize(withLinks);

  return (
    <>
      {purified ? (
        <div
          className="[&_a]:text-cerulean w-[calc(100vw-48px)] wrap-break-word sm:w-full [&_a]:break-all [&_a:hover]:underline"
          dangerouslySetInnerHTML={{
            __html: purified,
          }}
        />
      ) : (
        <div className="wrap-break-word">{source}</div>
      )}
    </>
  );
};

export function DescriptionSection() {
  const { metadata } = useJBProjectMetadataContext();
  const { description, name } = metadata?.data ?? {};

  const { hasPermission } = useUserPermissions();
  const canEditMetadata = hasPermission("SET_PROJECT_URI");


  return (
    <div className="text-sm">
      {canEditMetadata && (
        <div className="flex items-center gap-2 mb-4">
          <EditMetadataDialog />
          {/* Maybe add pause payment/edit metadata function */}
        </div>
      )}
      
      <LoansTable />

      <ChartSection />

      <DaoData />

      <div className="mt-6">
        <RichPreview source={description || name || "..."} />
      </div>

      <SocialLinks />
    </div>
  );
}
