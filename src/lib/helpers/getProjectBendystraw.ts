import * as Sentry from "@sentry/nextjs";
import { unstable_cache } from "next/cache";
import {
  ProjectDocument,
  ProjectQuery,
  ProjectQueryVariables,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";

async function _fetchProjectData({
  projectId,
  chainId,
  version
}: {
  projectId: number;
  chainId: number;
  version: number;
}): Promise<ProjectQuery["project"] | null> {
  try {
    const client = getBendystrawClient(chainId);

    const project = await client.request<ProjectQuery, ProjectQueryVariables>(
      ProjectDocument,
      {
        chainId: Number(chainId),
        projectId: Number(projectId),
        version: Number(version),
      }
    );

    return project.project;
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to fetch project:", err);
    return null;
  }
}


export const fetchProjectData = unstable_cache(
  _fetchProjectData,
  ["project-data"],
  {
    revalidate: 900,        // revalidate every 15 mins
    tags: ["project-data"], // allow for on-demand revalidation
  }
);
