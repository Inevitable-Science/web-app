import {
  DaoResponse,
  DaoResponseZ,
  TokenResponse,
  TokenResponseZ,
  TreasuryResponse,
  TreasuryResponseZ,
} from "@/lib/types/AnalyticTypes";
import { LegacyProjectProvider } from "./DataProvider";
import { DaoPage } from "./components/DaoPage";

import { headers } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadata } from "@/lib/metadata";

interface Props {
  params: Promise<{
    project: string;
  }>;
}

interface PageData {
  projectData: DaoResponse;
  treasuryData: TreasuryResponse;
  tokenData: TokenResponse;
}

export const revalidate = 900; // Revalidate every 15 minutes

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = `/project/${params.project}`;
  const url = new URL(fullPath, origin);

  const pageData = await getProjectData(params.project);
  const projectData = pageData?.projectData;

  if (!projectData) return notFound();

  return {
    title: `${projectData.name} | Inevitable Science`,
    description: projectData.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${projectData.name} | Inevitable Science`,
      description: projectData.description,
      siteName: "Inevitable Science",
      images: [
        {
          url: projectData.logo,
          width: 800,
          height: 800,
          alt: "preview image",
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title: `${projectData.name} | Inevitable Science`,
      description: projectData.description,
      card: "summary_large_image",
      images: [projectData.logo],
    },
    manifest: metadata.manifest,
  };
}

async function getProjectData(projectName: string): Promise<PageData | null> {
  try {
    const projectResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/${projectName}`
    );
    if (!projectResponse) throw new Error("Failed to fetch project data");

    const projectData = await projectResponse.json();
    const validatedProjectData = DaoResponseZ.parse(projectData);

    const [treasuryRes, tokenRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/treasury/${projectName}`),
      fetch(
        `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/token/${validatedProjectData.nativeToken.name}`
      ),
    ]);

    if (!treasuryRes.ok || !tokenRes.ok) {
      throw new Error("Failed to fetch analytics data");
    }

    const [treasuryData, tokenData] = await Promise.all([
      treasuryRes.json(),
      tokenRes.json(),
    ]);

    const validatedTreasuryData = TreasuryResponseZ.parse(treasuryData);
    const validatedTokenData = TokenResponseZ.parse(tokenData);

    return {
      projectData: validatedProjectData,
      treasuryData: validatedTreasuryData,
      tokenData: validatedTokenData,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function ProjectPage(props: Props) {
  const params = await props.params;
  const project = params.project;
  const pageData = await getProjectData(project);

  if (!pageData) return notFound();

  return (
    <LegacyProjectProvider
      daoData={pageData.projectData}
      treasuryAnalytics={pageData.treasuryData}
      tokenAnalytics={pageData.tokenData}
    >
      <DaoPage />
    </LegacyProjectProvider>
  );
}
