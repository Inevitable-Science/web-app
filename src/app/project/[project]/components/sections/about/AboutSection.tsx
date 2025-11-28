"use client";

import { useEffect } from "react";
import DOMPurify from "dompurify";
import Image from "next/image";
import { useData } from "../../../DataProvider";
import { Globe } from "lucide-react";

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
        className="w-[calc(100vw-48px)] break-words sm:w-full [&_a:hover]:underline [&_a]:break-all [&_a]:text-cerulean"
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

export function DescriptionSection() {
  const { analyticsData } = useData();

  return (
    <div className="text-sm">
      <RichPreview source={analyticsData?.daoData?.description || "..."} />

      <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-grey-450 p-[12px]">
        {analyticsData?.daoData?.socials.site && (
          <a
            className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
            href={analyticsData?.daoData?.socials.site}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe height="20" width="20" />
            View our Website
          </a>
        )}

        {analyticsData?.daoData?.socials.discord && (
          <a
            className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
            href={analyticsData?.daoData?.socials.discord}
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

        {analyticsData?.daoData?.socials.discord && (
          <a
            className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
            href={`https://x.com/${analyticsData?.daoData?.socials.x}`}
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
