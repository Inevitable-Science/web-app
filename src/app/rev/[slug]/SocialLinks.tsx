import { useJBProjectMetadataContext } from "juice-sdk-react";
import { Globe } from "lucide-react";
import Image from "next/image";

export function SocialLinks() {
  const { metadata: metadataContext } = useJBProjectMetadataContext();
  const metadata = metadataContext.data;

  // Ensure the discord link has a protocol
  const discordLink = metadata?.discord
    ? metadata.discord.startsWith("http")
      ? metadata.discord
      : `https://${metadata.discord}`
    : "";

  const websiteUrl = metadata?.infoUri
    ? metadata.infoUri.startsWith("http")
      ? metadata.infoUri
      : `https://${metadata.infoUri}`
    : "";

  if (!websiteUrl && !discordLink && !metadata?.twitter) return;

  return (
    <div className="bg-grey-450 mt-6 flex flex-col gap-2 rounded-2xl p-[12px]">
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

      {metadata?.twitter && (
        <a
          className="background-color flex items-center gap-2 rounded-2xl p-[16px]"
          href={`https://x.com/${metadata.twitter}`}
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
