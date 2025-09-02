"use client"

import { CowSwapWidgetParams, CowSwapWidget, CowSwapWidgetPalette, EthereumProvider, TradeType } from "@cowprotocol/widget-react";
//import { useAccount, useConnectorClient } from "wagmi";
//import { useData } from "../../DataProvider";
import { useEip1193Provider } from "@/hooks/useEip1193Provider";

interface TokenState {
  token: string;
}

// DATA_TODO: Make this component work with the web3 provider, view https://widget.cow.fi/

export function SwapWidget({ token } : TokenState) {
  //const provider = window.ethereum;
  const provider = useEip1193Provider();

  const params: CowSwapWidgetParams = {
    appCode: "Inevitable",
    width: "100%",
    height: "582px",
    chainId: 1,
    tokenLists: [
      "https://raw.githubusercontent.com/Inevitable-Science/web-app/refs/heads/frontend/public/web3/tokenlist.schema.json"
    ],
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
    customTokens: [], //tokenList,
  };

  return (
    <div>
      <CowSwapWidget params={params} provider={provider} />
    </div>
  );
}