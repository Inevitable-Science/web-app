import { GraphQLClient } from "graphql-request";
import { cache } from "react";
import {
  arbitrum,
  base,
  mainnet,
  optimism
} from "viem/chains";


const bendystrawUrl = process.env.NEXT_PUBLIC_BENDYSTRAW_URL;
const testnetBendystrawUrl = process.env.NEXT_PUBLIC_TESTNET_BENDYSTRAW_URL;

function getBendystrawUrl(chainId: number): string {
  const isMainnet = [mainnet, base, arbitrum, optimism].some((c) => c.id === chainId);

  if (!bendystrawUrl || !testnetBendystrawUrl) 
    throw new Error("Missing bendystraw environment variable");

  return isMainnet ? bendystrawUrl : testnetBendystrawUrl;
};

export const getBendystrawClient = cache((chainId: number) => {
  const url = getBendystrawUrl(chainId);
  return new GraphQLClient(`${url}/graphql`);
});
