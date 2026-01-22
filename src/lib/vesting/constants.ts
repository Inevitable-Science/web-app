import { ViemChainIdType } from "@/lib/wagmiConfig";
import { Address } from "viem";

interface VestingContract {
  name: string;
  logo: string;
  tokenAddress: Address;
  vestingContract: Address;
  vestingContractChainId: ViemChainIdType;
}

export const scheduleCreateRole =
  "0x01d6ebbe244ac14dd8a7a12f932c0ce6e9bb9236c9b55d3756a6b13de75cdc33";

export const vestingContracts: VestingContract[] = [
  {
    name: "hydradao",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/hydra.svg",
    tokenAddress: "0xaF04f0912E793620824F4442b03F4d984Af29853",
    vestingContract: "0x87d83a88cdc3bfe53877cf852013fc76c8669a99",
    vestingContractChainId: 1,
  },
  {
    name: "cryodao",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/cryo.svg",
    tokenAddress: "0xf4308b0263723b121056938c2172868e408079d0",
    vestingContract: "0xF5BdfeE7910c561606e6A19Bbf0319238A6a2340",
    vestingContractChainId: 1,
  },
  {
    name: "erectusdao",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/yuge.svg",
    tokenAddress: "0xFdc9D2A3cae56e484a85de3C2e812784a8184d0D",
    vestingContract: "0xD8D29d907C248BE3721C0c434c792a127113b297",
    vestingContractChainId: 1,
  },
  {
    name: "cryorat",
    logo: "https://cdn.inevitable.science/static/img/daos/tokenLogos/cryorat.webp",
    tokenAddress: "0x4cd1B2874e020C5bf08c4bE18Ab69ca86EC25fEf",
    vestingContract: "0x9dad05FAD7b20C8bb66e5b7796a4E601967e2868",
    vestingContractChainId: 1,
  },
];
