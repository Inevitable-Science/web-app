import { TokenResponseZ, TreasuryResponseZ } from "@/lib/types/AnalyticTypes";
import { Providers } from "./Providers";
import { IvxPageDataProvider } from "./DataProvider";
import { JBChainId } from "juice-sdk-react";
import { notFound } from "next/navigation";
import MainIvxLayout from "./components/Main";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata";

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
    manifest: metadata.manifest,
  };
}

async function fetchIvxData() {
  try {
    const [treasuryRes, tokenRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/treasury/hydra`),
      fetch(`${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/token/cryo`),
    ]);

    if (!treasuryRes.ok || !tokenRes.ok) {
      throw new Error("Unable to fetch data");
    }

    const [treasuryData, tokenData] = await Promise.all([
      treasuryRes.json(),
      tokenRes.json(),
    ]);

    const validatedTreasuryData = TreasuryResponseZ.parse(treasuryData);
    const validatedTokenData = TokenResponseZ.parse(tokenData);

    return {
      treasuryData: validatedTreasuryData,
      tokenData: validatedTokenData,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export default async function IvxTokenPage() {
  const pageData = await fetchIvxData();
  if (!pageData) return notFound();

  return (
    <>
      {/*<Providers chainId={1 as JBChainId} projectId={64n as bigint} version={4}>*/}
      <Providers chainId={1 as JBChainId} projectId={17n as bigint} version={5}>
        <IvxPageDataProvider
          tokenData={pageData.tokenData}
          treasuryData={pageData.treasuryData}
        >
          <MainIvxLayout />
        </IvxPageDataProvider>
      </Providers>
    </>
  );
}
