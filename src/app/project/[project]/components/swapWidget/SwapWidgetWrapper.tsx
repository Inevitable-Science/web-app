"use client";
import { useEffect, useMemo, useState } from "react";
import { SwapWidget } from "./SwapWidget";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";

type Props = {
  placement: "mobile" | "desktop";
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function SwapWidgetWrapper({ placement }: Props) {
  const isMobile = useIsMobile();
  const tokenAnalytics = useLegacyProjectStore(
    (state) => state.tokenAnalytics
  );

  const swapWidget = useMemo(() => {
    if (!tokenAnalytics?.selectedToken?.address) return null;
    return <SwapWidget token={tokenAnalytics.selectedToken.address} />;
  }, [tokenAnalytics?.selectedToken?.address]);

  if (placement === "mobile" && isMobile !== true) return null;
  if (placement === "desktop" && isMobile !== false) return null;

  return <>{swapWidget}</>;
}
