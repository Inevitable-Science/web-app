import { preload } from "react-dom";
import { JBProjectProviderRoot } from "@/store/JBProjectProviders";
import { notFound } from "next/navigation";
import MainIvxLayout from "./components/Main";

import type { Metadata } from "next";
import { metadata as siteMetadata } from "@/lib/metadata";
import { RevnetDataProvider } from "@/store/RevnetDataContext";
import { fetchTreasuryData } from "@/lib/helpers/fetchTreasuryData";
import { fetchTokenData } from "@/lib/helpers/fetchTokenData";
import { fetchProjectData } from "@/lib/helpers/getProjectBendystraw";

// Set to 15 minutes but capped by bendystraw request @ 5 min
export const revalidate = 900;

const url = new URL("/ivx", siteMetadata.siteUrl);

export const metadata: Metadata = {
  title: "IVX Token | Inevitable Science",
  description: siteMetadata.description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: "IVX Token | Inevitable Science",
    description: siteMetadata.description,
    siteName: siteMetadata.siteName,
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
    description: siteMetadata.description,
    card: "summary_large_image",
    images: [
      "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
    ],
  },
};

export default async function IvxTokenPage() {
  preload(
    "https://cdn.inevitable.science/static/img/layout/ivx/ivx_backdrop.webp",
    {
      as: "image",
      fetchPriority: "high",
    }
  );

  const [treasuryData, tokenData, projectData] = await Promise.all([
    fetchTreasuryData("hydradao"),
    fetchTokenData("hydra"),
    fetchProjectData({
      projectId: Number(17n),
      chainId: 1,
      version: 5,
    }),
  ]);

  if (!treasuryData || !tokenData || !projectData) return notFound();

  return (
    <>
      {/*<Providers chainId={1 as JBChainId} projectId={64n as bigint} version={4}>*/}
      <JBProjectProviderRoot
        chainId={1}
        //projectId={17n as bigint}
        //chainId={11155111}
        projectId={BigInt(3)}
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
