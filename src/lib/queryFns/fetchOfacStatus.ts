import { Address } from "viem";
import z from "zod";

const OfacResponseZ = z.object({
  isGoodAddress: z.boolean()
});

export async function fetchOfacStatus(address: Address) {
  const response = await fetch(`/api/ofac/${address}`);
  
  if (!response.ok) throw new Error("Failed to fetch OFAC status");
  const data = await response.json();

  return OfacResponseZ.parse(data);
};
