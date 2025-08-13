import { headers } from "next/headers";
import type { Metadata } from "next";
import { request } from "graphql-request";
import { SUBGRAPH_URLS } from "../../graphql/constants";
import { JB_CHAINS, jbUrn } from "juice-sdk-core";

interface ProjectsQueryResult {
  projects: {
    projectId: string;
    metadataUri: string;
    handle: string;
    contributorsCount: number;
    createdAt: string;
  }[];
}

export const revalidate = 300;

function buildMetadata({
  title,
  description,
  imageUrl,
  url,
  imageWidth,
  imageHeight
}: {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  imageWidth: number;
  imageHeight: number;
}): Metadata {
  return {
    title,
    openGraph: {
      title,
      description,
      url,
      // images: [{ url: imageUrl, width: 1200, height: 800, alt: `${title} preview image` }],
      images: [{ url: imageUrl, width: imageWidth, height: imageHeight, alt: `${title} preview image` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

async function getProjectMetadata(slug: string): Promise<{ handle: string; logoUri?: string } | null> {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Fetching project metadata for slug:", slug);
    }

    const cleanSlug = slug.split("?")[0]?.trim();
    if (!cleanSlug || typeof cleanSlug !== "string") {
      throw new Error("Missing or malformed slug");
    }

    const decoded = decodeURIComponent(cleanSlug);

    let projectId: bigint;
    let chainId: number;

    if (decoded === "@stasis") {
      projectId = 64n;
      chainId = 1;
    } else {
      if (!decoded.includes(":")) {
        throw new Error("Missing namespace in slug");
      }

      const urn = jbUrn(decoded);

      if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
        throw new Error("Invalid URN");
      }

      projectId = urn.projectId;
      chainId = Number(urn.chainId);
    }

    if (!(chainId in SUBGRAPH_URLS)) {
      console.error("No valid subgraph URL for chain: " + chainId);
      return null;
    }

    const subgraphUrl = SUBGRAPH_URLS[chainId as keyof typeof SUBGRAPH_URLS];
    if (!subgraphUrl) {
      console.error("Subgraph URL is undefined for chain: " + chainId);
      return null;
    }

    const query = `
      query Projects($projectId: Int!) {
        projects(where: { projectId: $projectId }, first: 1, skip: 0) {
          projectId
          metadataUri
          handle
          contributorsCount
          createdAt
        }
      }
    `;

    const variables = { projectId: Number(projectId) };

    const data = await request<ProjectsQueryResult>(subgraphUrl, query, variables);
    if (!data.projects.length) {
      console.warn("No project found for projectId", projectId);
      return { handle: "project" };
    }

    const project = data.projects[0];

    // If handle exists, return it directly
    if (project.handle) {
      return { handle: project.handle };
    }

    // Try to resolve from IPFS metadata if no handle
    let ipfsHash = "";
    if (typeof project.metadataUri === "string") {
      if (project.metadataUri.startsWith("ipfs://")) {
        ipfsHash = project.metadataUri.replace("ipfs://", "");
      } else if (/^[A-Za-z0-9]{46,}$/.test(project.metadataUri)) {
        ipfsHash = project.metadataUri;
      }
    }

    if (!ipfsHash) {
      console.warn("Invalid metadata URI, skipping IPFS fetch");
      return { handle: "project" };
    }

    try {
      const metadataRes = await fetch(`https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${ipfsHash}`);
      const metadata = await metadataRes.json();
      return {
        handle: metadata.name ?? "project",
        logoUri: metadata.logoUri?.startsWith("ipfs://")
          ? `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${metadata.logoUri.replace("ipfs://", "")}`
          : metadata.logoUri,
      };
    } catch (err) {
      console.error("Failed to fetch metadata from IPFS:", err);
      return { handle: "project" };
    }
  } catch (err) {
    console.warn("getProjectMetadata error:", err);
    return null;
  }
}

/*async function getProjectMetadata(slug: string): Promise<{ handle: string; logoUri?: string } | null> {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Fetching project metadata for slug:", slug);
    }
    const cleanSlug = slug.split("?")[0]?.trim();
    if (!cleanSlug || typeof cleanSlug !== "string" || !cleanSlug.includes(":")) {
      throw new Error("Missing or malformed slug");
    }

    const urn = jbUrn(decodeURIComponent(cleanSlug));
    if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
      throw new Error("Invalid URN");
    }
    if (!(urn.chainId in SUBGRAPH_URLS)) {
      console.error("No valid subgraph URL for chain: " + urn.chainId);
      return null;
    }

    const chainId = Number(urn.chainId) as keyof typeof SUBGRAPH_URLS;
    const subgraphUrl = SUBGRAPH_URLS[chainId];
    if (!subgraphUrl) {
      console.error("Subgraph URL is undefined for chain: " + urn.chainId);
      return null;
    }

    const query = `
      query Projects($projectId: Int!) {
        projects(where: { projectId: $projectId }, first: 1, skip: 0) {
          projectId
          metadataUri
          handle
          contributorsCount
          createdAt
        }
      }
    `;

    const variables = { projectId: Number(urn.projectId) };

    const data = await request<ProjectsQueryResult>(subgraphUrl, query, variables);
    if (!data.projects.length) {
      console.warn("No project found for projectId", urn.projectId);
      return { handle: "project" };
    }
    const project = data.projects[0];
    if (!project.handle) {
      let ipfsHash = "";
      if (typeof project.metadataUri === "string") {
        if (project.metadataUri.startsWith("ipfs://")) {
          ipfsHash = project.metadataUri.replace("ipfs://", "");
        } else if (/^[A-Za-z0-9]{46,}$/.test(project.metadataUri)) {
          ipfsHash = project.metadataUri;
        }
      }
      if (!ipfsHash) {
        console.warn("Invalid metadata URI, skipping IPFS fetch");
        return { handle: "project" };
      }
      try {
        const metadataRes = await fetch(`https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${ipfsHash}`);
        const metadata = await metadataRes.json();
        return {
          handle: metadata.name ?? "project",
          logoUri: metadata.logoUri?.startsWith("ipfs://")
            ? `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${metadata.logoUri.replace("ipfs://", "")}`
            : metadata.logoUri,
        };
      } catch (err) {
        console.error("Failed to fetch metadata from IPFS:", err);
        return { handle: "project" };
      }
    }
    return { handle: project.handle ?? "project" };
  } catch (err) {
    console.warn("getProjectMetadata error:", err);
    return null;
  }
}*/

export async function generateMetadata(
  props: {
    params: Promise<{ slug?: string[] }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;
  const slugPath = decodeURIComponent(params?.slug?.join("/") ?? "");

  if (
    !slugPath.includes(":") &&
    slugPath != "@stasis"
  ) {
    const url = new URL(`/${slugPath}`, origin);
    const title = "Inevitable Protocol";
    const description = "Begin your journey. Build the future of life—together.";
    const imageUrl = `${origin}/assets/img/branding/seo_banner.png`;

    const imageWidth = 1200;
    const imageHeight = 800;

    return buildMetadata({ title, description, imageUrl, url: url.href, imageWidth, imageHeight });
  }

  const fullPath = `/${slugPath}`;
  const url = new URL(fullPath, origin);

  // Fetch project metadata using the slugPath as the handle
  const project = slugPath ? await getProjectMetadata(slugPath) : null;
  const projectName = project ? project.handle : "project";

  let imgUrl = project?.logoUri || `${origin}/assets/img/branding/seo_banner.png`;

  let metadataTitle;
  let imageWidth = 1200;
  let imageHeight = 800;
  if (projectName !== "project"){
    metadataTitle = `${projectName} | Inevitable Protocol`;
    imageWidth = 800;
    imageHeight = 800;
  } else {
    metadataTitle = "Inevitable Protocol"
  }

  return buildMetadata({
    title: metadataTitle,
    description: "Begin your journey. Build the future of life—together.",
    imageUrl: imgUrl,
    url: url.href,
    imageWidth,
    imageHeight
  });
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}