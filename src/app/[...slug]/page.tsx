import { Providers } from "./Providers";
import { DashboardContent } from "./components/NetworkDashboard/NetworkDashboard";
import { notFound } from "next/navigation";
import { ProjectQuery } from "@/generated/graphql";
import { NetworkDataProvider } from "./components/NetworkDashboard/NetworkDataContext";
import { headers } from "next/headers";
import { Metadata } from "next";
import { metadata } from "@/lib/metadata";
import {
  fetchProjectAnalytics,
  fetchProjectData,
  parseSlug,
  resolveIpfsLogo,
} from "./ProjectHelpers";

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
  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  let config;
  let projectData: ProjectQuery["project"] | null;
  try {
    config = parseSlug(params.slug);
    const projectResponse = await fetchProjectData(config);
    projectData = projectResponse.project;
  } catch (err) {
    console.error(err);
    return notFound();
  }

  if (!config || !projectData) {
    return notFound();
  }

  const projectLogo = await resolveIpfsLogo(projectData.metadataUri, imgUrl);

  return {
    title: `${projectData.name} | Inevitable Protocol`,
    description: "Begin your journey. Build the future of life—together.",
    alternates: { canonical: url },
    openGraph: {
      title: `${projectData.name} | Inevitable Protocol`,
      description: "Begin your journey. Build the future of life—together.",
      siteName: "Inevitable Protocol",
      images: [
        {
          url: projectLogo,
          width: 800,
          height: 800,
          alt: `${projectData.name} | Inevitable Protocol preview image`,
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title: `${projectData.name} | Inevitable Protocol`,
      description: "Begin your journey. Build the future of life—together.",
      card: "summary_large_image",
      images: [projectLogo],
    },
    manifest: metadata.manifest,
  };
}

export default async function Page(props: Props) {
  const params = await props.params;

  let config;
  let project: ProjectQuery | null;
  try {
    config = parseSlug(params.slug);
    project = await fetchProjectData(config);

    console.log(project);
  } catch (err) {
    console.error(err);
    return notFound();
  }

  if (!config || !project.project?.name) {
    return notFound();
  }

  const analytics = await fetchProjectAnalytics(project.project?.name);

  return (
    <Providers {...config}>
      <NetworkDataProvider projectData={project} analyticsData={analytics}>
        <DashboardContent />
      </NetworkDataProvider>
    </Providers>
  );
}
