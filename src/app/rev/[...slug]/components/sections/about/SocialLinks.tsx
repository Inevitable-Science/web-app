import { JBProjectMetadata } from "juice-sdk-core";
import { AsyncData } from "juice-sdk-react/dist/contexts/types";
import { Globe } from "lucide-react";
import Image from "next/image";

export function SocialLinks(data: AsyncData<JBProjectMetadata>) {
  const dataHolder = data?.data;

  // Ensure the discord link has a protocol
  const discordLink = dataHolder?.discord
    ? dataHolder.discord.startsWith("http")
      ? dataHolder.discord
      : `https://${dataHolder.discord}`
    : "";

  const websiteUrl = dataHolder?.infoUri
    ? dataHolder.infoUri.startsWith("http")
      ? dataHolder.infoUri
      : `https://${dataHolder.infoUri}`
    : "";

  if (!websiteUrl && !discordLink && !dataHolder?.twitter) return;

  return (
    <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-grey-450 p-[12px]">
      {websiteUrl && (
        <a
          className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Globe height="20" width="20" />
          View our Website
        </a>
      )}

      {discordLink && (
        <a
          className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
          href={discordLink}
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

      {dataHolder?.twitter && (
        <a
          className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
          href={`https://x.com/${dataHolder.twitter}`}
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
  );
}
