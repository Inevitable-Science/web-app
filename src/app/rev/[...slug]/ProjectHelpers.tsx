import { JB_CHAINS, JBChainId, jbUrn, JBVersion } from "juice-sdk-core";
import { ProjectDocument } from "@/generated/graphql";
import {
  DaoResponse,
  DaoResponseSchema,
  TokenResponse,
  TokenResponseSchema,
  TreasuryResponse,
  TreasuryResponseSchema,
} from "@/lib/types/AnalyticTypes";
import request from "graphql-request";

interface ProjectAnalyticsResponse {
  daoData: DaoResponse;
  treasuryData: TreasuryResponse | null;
  tokenData: TokenResponse | null;
}

export function parseSlug(slug?: string) {
  if (!slug) throw new Error("No URN found");
  const decoded = decodeURIComponent(slug);

  if (decoded === "@stasis") {
    return { projectId: 64n, chainId: 1 as JBChainId, version: 4 as JBVersion };
  }

  const urn = jbUrn(decoded);
  if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
    throw new Error("Invalid URN format or unknown chain");
  }

  return {
    projectId: urn.projectId,
    chainId: urn.chainId,
    version: urn.version,
  };
}

export async function resolveIpfsLogo(
  metadataUri: string | null,
  fallbackUrl: string
): Promise<string> {
  if (!metadataUri || typeof metadataUri !== "string") {
    return fallbackUrl;
  }

  let ipfsHash = "";

  if (metadataUri.startsWith("ipfs://")) {
    ipfsHash = metadataUri.replace("ipfs://", "");
  } else if (/^[A-Za-z0-9]{46,}$/.test(metadataUri)) {
    ipfsHash = metadataUri;
  }

  if (!ipfsHash) return fallbackUrl;

  try {
    const metadataRes = await fetch(
      `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${ipfsHash}`
    );
    const metadata = await metadataRes.json();

    if (!metadata.logoUri) return fallbackUrl;

    return metadata.logoUri.startsWith("ipfs://")
      ? `https://${process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME}/ipfs/${metadata.logoUri.replace(
          "ipfs://",
          ""
        )}`
      : metadata.logoUri;
  } catch (err) {
    console.error("Failed to fetch IPFS metadata:", err);
    return fallbackUrl;
  }
}

export async function fetchProjectData(config: {
  projectId: bigint;
  chainId: number;
  version: number;
}) {
  const url = `${process.env.NEXT_PUBLIC_BENDYSTRAW_URL}/graphql`;

  try {
    const project = await request(url, ProjectDocument, {
      chainId: Number(config.chainId),
      projectId: Number(config.projectId),
      version: Number(config.version),
    });

    return project;
  } catch (err) {
    console.error("Failed to fetch project:", err);
    throw err;
  }
}

export async function fetchProjectAnalytics(
  projectName: string
): Promise<ProjectAnalyticsResponse | null> {
  try {
    const daoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/${projectName}`,
      { next: { revalidate: 900 } }
    );
    if (!daoResponse.ok) return null;
    const daoData = await daoResponse.json();
    const validatedDaoData = DaoResponseSchema.parse(daoData);

    // make it fetch token with token name from daoResponse
    const [treasuryResponse, tokenResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/treasury/${projectName}`, {
        next: { revalidate: 900 },
      }),
      fetch(
        `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/token/${validatedDaoData.nativeToken.name}`,
        { next: { revalidate: 900 } }
      ),
    ]);

    let treasuryData = null;
    let tokenData = null;

    if (treasuryResponse.ok) {
      try {
        const rawTreasury = await treasuryResponse.json();
        treasuryData = TreasuryResponseSchema.parse(rawTreasury);
      } catch (err) {
        console.error("Failed to parse treasury response", err);
        treasuryData = null;
      }
    }

    if (tokenResponse.ok) {
      try {
        const rawToken = await tokenResponse.json();
        tokenData = TokenResponseSchema.parse(rawToken);
      } catch (err) {
        console.error("Failed to parse token response", err);
        tokenData = null;
      }
    }

    return {
      daoData: validatedDaoData,
      treasuryData,
      tokenData,
    };
  } catch {
    return null;
  }
}
