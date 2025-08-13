"use client";

import { ConnectKitButton } from "@/components/ConnectKitButton";
import { formatEthAddress } from "@/lib/utils";
import { Button } from "../ui/button";

export const FooterLoginButton: React.FC = () => {
  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => {
          return (
            <Button onClick={show} variant="link">
              {isConnected ? ((address ? formatEthAddress(address) : "")) : "LOG IN"}
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  );
};