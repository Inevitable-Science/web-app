"use client";

import {
  CowSwapWidgetParams,
  CowSwapWidget,
  CowSwapWidgetPalette,
  EthereumProvider,
  TradeType,
} from "@cowprotocol/widget-react";
import { useEip1193Provider } from "@/hooks/useEip1193Provider";

interface TokenState {
  token: string;
}

export function SwapWidget({ token }: TokenState) {
  const provider = useEip1193Provider();

  const params: CowSwapWidgetParams = {
    appCode: "Inevitable",
    width: "100%",
    height: "582px",
    chainId: 1,
    tokenLists: ["https://inev.profiler.bio/web3/tokenlist.schema.json"],
    tradeType: TradeType.SWAP,
    sell: { asset: "USDC", amount: "100" },
    buy: { asset: token, amount: "0" },
    enabledTradeTypes: [TradeType.SWAP],
    theme: {
      baseTheme: "dark",
      primary: "#c4c4c4",
      paper: "#242424",
      text: "#ffffff",
    } as CowSwapWidgetPalette,
    standaloneMode: false,
    disableToastMessages: true,
    disableProgressBar: false,
    hideBridgeInfo: false,
    hideOrdersTable: false,
    images: {},
    sounds: {},
    customTokens: [],
  };

  return (
    <div>
      <CowSwapWidget params={params} provider={provider as EthereumProvider} />
    </div>
  );
}
