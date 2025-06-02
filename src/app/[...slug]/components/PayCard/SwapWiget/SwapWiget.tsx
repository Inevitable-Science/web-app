/*"use client";
import { useState } from "react";
import { CowSwapWidget, TradeType } from "@cowprotocol/widget-react";

export default function ImportTokenModal({ token, tokenList }) {
  const [provider, setProvider] = useState(null);

  const cowSwapWidgetParams = {
    appCode: "ProfilerBIO",
    width: "100%",
    height: "582px",
    chainId: 1,
    tokenLists: ["https://www.profiler.bio/web3/tokenlist.schema.json"],
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
    },
    standaloneMode: true,
    disableToastMessages: false,
    disableProgressBar: false,
    hideBridgeInfo: false,
    hideOrdersTable: false,
    images: {},
    sounds: {},
    customTokens: tokenList,
  };  

  return (
    <div className="swapWrapper">
      <CowSwapWidget params={cowSwapWidgetParams} provider={provider} />
    </div>
  );
}
*/