import Image from "next/image";

export function SocialLinks() {

  return (
    <div className="bg-grey-450 p-[12px] mt-6 flex flex-col gap-2 rounded-2xl">
      <a 
        className="background-color p-[16px] flex gap-2 rounded-2xl"
        href="https://discord.gg" // DATA_TODO: DAO Discord URL
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

      <a 
        className="background-color p-[16px] flex gap-2 rounded-2xl"
        href="https://x.com" // DATA_TODO: DAO X URL
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
    </div>
  );
};

