"use client";

import { ConnectKitButton } from "connectkit";
import { formatEthAddress } from "@/lib/utils";
import { Button } from "../ui/button";

export function FooterLoginButton() {
  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => {
          return (
            <Button onClick={show} variant="link">
              {isConnected
                ? address
                  ? formatEthAddress(address)
                  : ""
                : "LOG IN"}
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  );
};
