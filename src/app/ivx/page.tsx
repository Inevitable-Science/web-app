import { JBProjectProviderRoot } from "@/store/JBProjectProviders";
import { JBChainId } from "juice-sdk-react";
import { notFound } from "next/navigation";
import MainIvxLayout from "./components/Main";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata";
import { RevnetDataProvider } from "@/store/RevnetDataContext";
import { fetchTreasuryData } from "@/lib/helpers/fetchTreasuryData";
import { fetchTokenData } from "@/lib/helpers/fetchTokenData";
import { fetchProjectData } from "@/lib/helpers/getProjectBendystraw";

export const revalidate = 900; // Revalidate every 15 minutes

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  return {
    title: "IVX Token | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "IVX Token | Inevitable Science",
      description: metadata.description,
      siteName: metadata.siteName,
      images: [
        {
          url: "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "IVX Token | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: [
        "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
      ],
    },
  };
}

export default async function IvxTokenPage() {
  const [treasuryData, tokenData, projectData] = await Promise.all([
    fetchTreasuryData("hydradao"),
    fetchTokenData("hydra"),
    fetchProjectData({
      projectId: 17n,
      chainId: 1,
      version: 5,
    }),
  ]);

  if (!treasuryData || !tokenData || !projectData) return notFound();

  return (
    <>
      {/*<Providers chainId={1 as JBChainId} projectId={64n as bigint} version={4}>*/}
      <JBProjectProviderRoot
        chainId={1 as JBChainId}
        projectId={17n as bigint}
        version={5}
      >
        <RevnetDataProvider
          projectData={projectData}
          treasuryAnalytics={treasuryData}
          tokenAnalytics={tokenData}
          slug="ivx"
        >
          <MainIvxLayout />
        </RevnetDataProvider>
      </JBProjectProviderRoot>
    </>
  );
}
