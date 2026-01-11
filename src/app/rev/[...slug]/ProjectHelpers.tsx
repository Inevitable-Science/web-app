import { JB_CHAINS, JBChainId, jbUrn, JBVersion } from "juice-sdk-core";


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
