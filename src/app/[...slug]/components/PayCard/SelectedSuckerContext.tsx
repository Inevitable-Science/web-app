import React, { createContext, useContext, useState, ReactNode } from "react";
import { SuckerPair } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";

export interface SelectedSuckerContextType {
  peerChainId: number | undefined;
  selectedSucker: SuckerPair | undefined;
  setSelectedSucker: React.Dispatch<React.SetStateAction<SuckerPair | undefined>>;
}

const SelectedSuckerContext = createContext<SelectedSuckerContextType | undefined>(undefined);

export const SelectedSuckerProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();
  /* const [selectedSucker, setSelectedSucker] = useState<SuckerPair | undefined>(() => {
    return { peerChainId: chainId, projectId };
  }); */

  const [selectedSucker, setSelectedSucker] = useState<SuckerPair | undefined>(undefined);

  const contextValue: SelectedSuckerContextType = {
    peerChainId: chainId, // Add the missing property here
    selectedSucker,
    setSelectedSucker,
  };

  return (
    <SelectedSuckerContext.Provider value={contextValue}>
      {children}
    </SelectedSuckerContext.Provider>
  );
};

export const useSelectedSucker = () => {
  const context = useContext(SelectedSuckerContext);
  if (!context) {
    throw new Error("useSelectedSucker must be used within a SelectedSuckerProvider");
  }
  return context;
};
