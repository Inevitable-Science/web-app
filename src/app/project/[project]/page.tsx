import { LegacyProjectProvider } from "../../../store/LegacyProjectContext";
import { DaoPage } from "./components/DaoPage";

import { headers } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadata } from "@/lib/metadata";
import { fetchDaoData } from "@/lib/helpers/fetchDaoData";
import { fetchTreasuryData } from "@/lib/helpers/fetchTreasuryData";
import { fetchTokenData } from "@/lib/helpers/fetchTokenData";

interface Props {
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

export default async function ProjectPage(props: Props) {
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
      <DaoPage />
    </LegacyProjectProvider>
  );
}
