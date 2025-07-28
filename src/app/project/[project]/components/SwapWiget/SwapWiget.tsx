"use client";
import { useState, useEffect } from "react";
import { CowSwapWidgetParams, CowSwapWidget, CowSwapWidgetPalette, EthereumProvider, TradeType } from "@cowprotocol/widget-react";
import { useAccount } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";

interface TokenState {
  token: string;
}

// DATA_TODO: Make this component work with the web3 provider, view https://widget.cow.fi/

export function SwapWidget({ token } : TokenState) {
  //const [provider, setProvider] = useState(null);
  const [provider, setProvider] = useState<EthereumProvider | undefined>(undefined);

  const params: CowSwapWidgetParams = {
    appCode: "Inevitable",
    width: "100%",
    height: "582px",
    chainId: 1,
    tokenLists: [
      "https://files.cow.fi/tokens/CowSwap.json",
      "https://files.cow.fi/tokens/CoinGecko.json",
      "https://inevitable.science/web3/tokenlist.schema.json",
      "https://www.profiler.bio/web3/tokenlist.schema.json"
    ],
    tradeType: TradeType.SWAP,
    sell: { asset: "USDC", amount: "100" },
    //buy: { asset: "0xf4308b0263723b121056938c2172868e408079d0", amount: "0" },
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
    <div className="swapWrapper">
      <CowSwapWidget params={params} provider={provider} />
    </div>
  );
}