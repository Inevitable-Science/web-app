import { LegacyProjectProvider } from "@/store/LegacyProjectContext";

import { headers } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadata } from "@/lib/metadata";
import { fetchDaoData } from "@/lib/helpers/fetchDaoData";
import { fetchTreasuryData } from "@/lib/helpers/fetchTreasuryData";
import { fetchTokenData } from "@/lib/helpers/fetchTokenData";
import { Header } from "./components/Header";
import { TabSelectorLG, TabSelectorSM } from "./components/TabSelector";
import { OtherDaosCarousel } from "@/components/OtherDaosCarousel";
import { SwapWidgetWrapper } from "./components/swapWidget/SwapWidgetWrapper";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    project: string;
  }>;
}

export const revalidate = 900; // Revalidate every 15 minutes

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const projectName = params.project;

  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = `/project/${params.project}`;
  const url = new URL(fullPath, origin);

  const daoData = await fetchDaoData(projectName);
  if (!daoData) return notFound();

  return {
    title: `${daoData.name} | Inevitable Science`,
    description: daoData.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${daoData.name} | Inevitable Science`,
      description: daoData.description,
      siteName: "Inevitable Science",
      images: [
        {
          url: daoData.logo,
          width: 800,
          height: 800,
          alt: "preview image",
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title: `${daoData.name} | Inevitable Science`,
      description: daoData.description,
      card: "summary_large_image",
      images: [daoData.logo],
    },
    manifest: metadata.manifest,
  };
}

export default async function ProjectLayout(props: Props) {
  const params = await props.params;
  const projectName = params.project;

  const daoData = await fetchDaoData(projectName);
  if (!daoData) return notFound();

  const tokenName = daoData.nativeToken.name;

  const [treasuryData, tokenData] = await Promise.all([
    fetchTreasuryData(projectName),
    fetchTokenData(tokenName)
  ]);

  return (
    <LegacyProjectProvider
      daoData={daoData}
      treasuryAnalytics={treasuryData}
      tokenAnalytics={tokenData}
    >
      <div className="relative w-full">
        <div className="absolute inset-0 -z-10 w-full bg-[url('https://cdn.inevitable.science/static/img/dao_landing.webp')] bg-cover bg-center" />
        <Header />
      </div>

      <div className="ctWrapper mb-10 flex flex-wrap gap-10 px-4 pb-5 sm:mb-24 md:flex-nowrap">
        <TabSelectorLG />

        {/* Column 1 */}
        <div className="flex-1">
          <div className="block md:hidden">
            <div className="mt-1 max-h-[700px]">
              <SwapWidgetWrapper placement="mobile" />
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <section className="mb-10">
              <TabSelectorSM />

              <div className="sm:min-h-[700px]">
                {props.children}
              </div>
            </section>
          </div>
        </div>

        <div className="hidden w-full md:block md:w-[340px] lg:w-[400px]">
          <div className="mb-4">
            <SwapWidgetWrapper placement="desktop" />
          </div>
        </div>
      </div>

      <OtherDaosCarousel />
    </LegacyProjectProvider>
  );
}
