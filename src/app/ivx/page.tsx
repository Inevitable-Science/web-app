import {
  TokenResponseSchema,
  TreasuryResponseSchema,
} from "@/lib/types/AnalyticTypes";
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

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "IVX Token | Inevitable Protocol",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "IVX Token | Inevitable Protocol",
      description: metadata.description,
      siteName: metadata.siteName,
      images: [
        {
          url: imgUrl,
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "IVX Token | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
  };
}

async function fetchIvxData() {
  try {
    const [treasuryRes, tokenRes] = await Promise.all([
      fetch(`https://inev.profiler.bio/treasury/hydra`),
      fetch(`https://inev.profiler.bio/token/hydra`),
    ]);

    if (!treasuryRes.ok || !tokenRes.ok) {
      throw new Error("Unable to fetch data");
    }

    const [treasuryData, tokenData] = await Promise.all([
      treasuryRes.json(),
      tokenRes.json(),
    ]);

    const validatedTreasuryData = TreasuryResponseSchema.parse(treasuryData);
    const validatedTokenData = TokenResponseSchema.parse(tokenData);


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
      <Providers chainId={1 as JBChainId} projectId={4n as bigint} version={5}>
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
