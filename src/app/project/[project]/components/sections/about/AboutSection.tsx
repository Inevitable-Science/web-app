"use client";

import { useEffect } from "react";
import DOMPurify from "dompurify";
import Image from "next/image";
import { useLegacyProjectStore } from "../../../DataProvider";
import { Globe } from "lucide-react";
import { AnalyticsPreview } from "./AnalyticsPreview";

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
      '<a href="$2">$1</a>'
    );

    // Sanitize the generated HTML
    const purified = DOMPurify.sanitize(withLinks);

    return (
      <div
        className="[&_a]:text-cerulean w-[calc(100vw-48px)] wrap-break-word sm:w-full [&_a]:break-all [&_a:hover]:underline"
        dangerouslySetInnerHTML={{
          __html: purified,
        }}
      />
    );
  } catch (error) {
    console.error("HTML sanitization failed:", error);
    return <div className="wrap-break-word">{source}</div>;
  }
};

export function DescriptionSection() {
  const daoData = useLegacyProjectStore((state) => state.daoData);

  return (
    <div className="text-sm">
      <RichPreview source={daoData?.description || "..."} />{" "}
      {/* TODO: change this to have 2 rich previews, ref to figma */}
      <AnalyticsPreview />
      <RichPreview source={daoData?.description || "..."} />
      <div className="bg-grey-450 mt-6 flex flex-col gap-2 rounded-2xl p-[12px]">
        {daoData?.socials.site && (
          <a
            className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
            href={daoData?.socials.site}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe height="20" width="20" />
            View our Website
          </a>
        )}

        {daoData?.socials.discord && (
          <a
            className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
            href={daoData?.socials.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.inevitable.science/static/img/logo/socials/discord.svg"
              alt="Join Discord"
              height="20"
              width="20"
            />
            Join our Discord
          </a>
        )}

        {daoData?.socials.discord && (
          <a
            className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
            href={`https://x.com/${daoData?.socials.x}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.inevitable.science/static/img/logo/socials/x.svg"
              alt="Follow Our X"
              height="16"
              width="16"
            />
            Follow us on X
          </a>
        )}
      </div>
    </div>
  );
}
