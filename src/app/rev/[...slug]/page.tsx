import { Providers } from "./Providers";
import { PageLayout } from "./components/layout/PageLayout";
import { notFound } from "next/navigation";
import { ProjectQuery } from "@/generated/graphql";
import { ProjectDataProvider } from "../../../store/RevnetDataContext";
import { headers } from "next/headers";
import { Metadata } from "next";
import { metadata } from "@/lib/metadata";
import {
  parseSlug,
  resolveIpfsLogo,
} from "./ProjectHelpers";
import { fetchDaoData } from "@/lib/helpers/fetchDaoData";
import { fetchTreasuryData } from "@/lib/helpers/fetchTreasuryData";
import { fetchTokenData } from "@/lib/helpers/fetchTokenData";
import { fetchProjectData } from "@/lib/helpers/getProjectBendystraw";

interface Props {
  params: Promise<{ slug?: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = `/${decodeURIComponent(params.slug || "")}`;
  const url = new URL(fullPath, origin);

  let config;
  let projectData: ProjectQuery["project"] | null;
  try {
    config = parseSlug(params.slug);
    projectData = await fetchProjectData(config);
  } catch (err) {
    console.error(err);
    return notFound();
  }

  if (!config || !projectData) {
    return notFound();
  }

  const imgUrl =
    "https://cdn.inevitable.science/static/img/branding/seo_banner.png"; // used as fallback
  const projectLogo = await resolveIpfsLogo(projectData.metadataUri, imgUrl);

  return {
    title: `${projectData.name} | Inevitable Science`,
    description: "Begin your journey. Build the future of life—together.",
    alternates: { canonical: url },
    openGraph: {
      title: `${projectData.name} | Inevitable Science`,
      description: "Begin your journey. Build the future of life—together.",
      siteName: "Inevitable Science",
      images: [
        {
          url: projectLogo,
          width: 800,
          height: 800,
          alt: `${projectData.name} | Inevitable Science preview image`,
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title: `${projectData.name} | Inevitable Science`,
      description: "Begin your journey. Build the future of life—together.",
      card: "summary_large_image",
      images: [projectLogo],
    },
    manifest: metadata.manifest,
  };
}

export default async function Page(props: Props) {
  const params = await props.params;

  let config: ReturnType<typeof parseSlug>;
  try {
    config = parseSlug(params.slug);
  } catch {
    return notFound();
  }

  const project = await fetchProjectData(config);
  if (!project || !project?.name) {
    return notFound();
  }

  const daoData = await fetchDaoData(project.name);
  const tokenName = daoData?.nativeToken.name;
  
  const treasuryPromise = daoData
    ? fetchTreasuryData(project.name)
    : Promise.resolve(null);

  const tokenPromise = tokenName
    ? fetchTokenData(tokenName)
    : Promise.resolve(null);

  const [treasuryData, tokenData] = await Promise.all([
    treasuryPromise,
    tokenPromise,
  ]);
    

  return (
    <Providers {...config}>
      <ProjectDataProvider
        projectData={project}
        daoData={daoData}
        treasuryAnalytics={treasuryData}
        tokenAnalytics={tokenData}
      >
        <PageLayout />
      </ProjectDataProvider>
    </Providers>
  );
}
