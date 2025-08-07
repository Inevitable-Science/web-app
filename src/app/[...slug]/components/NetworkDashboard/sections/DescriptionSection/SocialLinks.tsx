import { JBProjectMetadata } from "juice-sdk-core";
import { AsyncData } from "juice-sdk-react/dist/contexts/types";
import Image from "next/image";

export function SocialLinks(data: AsyncData<JBProjectMetadata>) {
  const dataHolder = data?.data;

  // Ensure the discord link has a protocol
  const discordLink = dataHolder?.discord
    ? dataHolder.discord.startsWith("http") ? dataHolder.discord : `https://${dataHolder.discord}`
    : "";

  return (
    <div className="bg-grey-450 p-[12px] mt-6 flex flex-col gap-2 rounded-2xl">
      {discordLink && (
        <a
          className="background-color p-[16px] flex gap-2 rounded-2xl items-center"
          href={discordLink}
          target="_blank"
          rel="noopener noreferrer"
        >
        <Image
          src="/assets/img/logo/socials/discord.svg"
          alt="Join Discord"
          height="20"
          width="20"
        />
        Join our Discord
      </a>
      )}

      {dataHolder?.twitter && (
        <a
          className="background-color p-[16px] flex gap-2 rounded-2xl items-center"
          href={`https://x.com/${dataHolder.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/assets/img/logo/socials/x.svg"
            alt="Follow Our X"
            height="16"
            width="16"
          />
          Follow us on X
        </a>
      )}
    </div>
  );
};
