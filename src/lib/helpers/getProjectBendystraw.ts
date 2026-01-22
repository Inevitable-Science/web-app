import {
  ProjectDocument,
  ProjectQuery,
  ProjectQueryVariables,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";

export async function fetchProjectData(config: {
  projectId: bigint;
  chainId: number;
  version: number;
}): Promise<ProjectQuery["project"] | null> {
  try {
    const client = getBendystrawClient(config.chainId);

    const project = await client.request<ProjectQuery, ProjectQueryVariables>(
      ProjectDocument,
      {
        chainId: Number(config.chainId),
        projectId: Number(config.projectId),
        version: Number(config.version),
      }
    );

    return project.project;
  } catch (err) {
    console.error("Failed to fetch project:", err);
    return null;
  }
}
