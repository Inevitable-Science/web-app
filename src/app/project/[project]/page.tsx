import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DaoResponse, DaoResponseSchema } from '@/lib/types/AnalyticTypes';
import { metadata } from "@/lib/metadata";
import { DataProvider } from "./DataProvider";
import { DaoPage } from "./components/DaoPage";

interface Props {
  params: {
    project: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = `/project/${params.project}`;
  const url = new URL(fullPath, origin);
  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  const projectData = await getProjectData(params.project);
  
  if (!projectData) {
    return {
      title: "Page Not Found | Inevitable Protocol", 
      description: metadata.description,
      alternates: {
        canonical: url, 
      },
      openGraph: {
        title: "Page Not Found | Inevitable Protocol", 
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
        title: "Page Not Found | Inevitable Protocol",
        description: metadata.description,
        card: "summary_large_image",
        images: [imgUrl],
      },
      manifest: metadata.manifest,
    };
  } else {
    return {
      title: `${projectData.name} | Inevitable Protocol`,
      description: projectData.description,
      alternates: { canonical: url },
      openGraph: {
        title: `${projectData.name} | Inevitable Protocol`,
        description: projectData.description,
        siteName: "Inevitable Protocol",
        images: [{ url: projectData.logo, width: 800, height: 800, alt: `preview image` }],
        url,
        type: "article",
      },
      twitter: {
        title: `${projectData.name} | Inevitable Protocol`,
        description: projectData.description,
        card: "summary_large_image",
        images: [imgUrl],
      },
      manifest: metadata.manifest,
    };
  };
}

async function getProjectData(project: string): Promise<DaoResponse | null>{

  const response = await fetch(`https://inev.profiler.bio/dao/${project}`)
  if (!response.ok) return null;

  const json = await response.json();

  try {
    const data = DaoResponseSchema.parse(json);
    console.log(data.name);
    console.log(data);
    return data;
  } catch (error) {
    console.error('Invalid response structure', error);
    return null;
  }
}

export default async function ProjectPage({ params } : Props) {
  const project = params.project;
  const projectData = await getProjectData(project);

  if (!projectData) return notFound();
  
  return (
    <DataProvider daoName={project} daoData={projectData}>
      <DaoPage />
    </DataProvider>
  );
};

