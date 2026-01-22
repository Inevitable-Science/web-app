"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import {
  TokenResponse,
  DaoResponse,
  TreasuryResponse,
} from "@/lib/types/AnalyticTypes";
import { createStore, StoreApi, useStore } from "zustand";
import { ViemChainIdType } from "@/lib/wagmiConfig";
import { Address } from "viem";

export type TabType = "about" | "activity" | "analytics" | "treasury" | "vesting";

interface ContextProps {
  children: ReactNode;
  daoData: DaoResponse;
  treasuryAnalytics: TreasuryResponse | null;
  tokenAnalytics: TokenResponse | null;
}

export interface LegacyProjectStore {
  daoData: DaoResponse;
  treasuryAnalytics: TreasuryResponse | null;
  tokenAnalytics: TokenResponse | null;

  vestingContractAddress: Address | null;
  setVestingContractAddress: (address: Address) => void;

  vestingChainId: ViemChainIdType | null;
  setVestingChainId: (chainId: ViemChainIdType) => void;

  isOwner: boolean;
  setIsOwner: (bool: boolean) => void;

  canCreate: boolean;
  setCanCreate: (bool: boolean) => void;

  hasSchedule: boolean;
  setHasSchedule: (bool: boolean) => void;
}

const LegacyProjectContext = createContext<
  StoreApi<LegacyProjectStore> | undefined
>(undefined);

export function LegacyProjectProvider({
  children,
  daoData,
  treasuryAnalytics,
  tokenAnalytics,
}: ContextProps) {
  const [store] = useState(() =>
    createStore<LegacyProjectStore>((set) => ({
      daoData,
      treasuryAnalytics,
      tokenAnalytics,

      vestingContractAddress: null,
      setVestingContractAddress: (vestingContractAddress) => set({ vestingContractAddress }),

      vestingChainId: null,
      setVestingChainId: (vestingChainId) => set({ vestingChainId }),

      isOwner: false,
      setIsOwner: (isOwner) => set({ isOwner }),

      canCreate: false,
      setCanCreate: (canCreate) => set({ canCreate }),

      hasSchedule: false,
      setHasSchedule: (hasSchedule) => set({ hasSchedule }),
    }))
  );

  return (
    <LegacyProjectContext.Provider value={store}>
      {children}
    </LegacyProjectContext.Provider>
  );
}

export function useLegacyProjectStore<T>(
  selector: (state: LegacyProjectStore) => T
) {
  const context = useContext(LegacyProjectContext);

  if (!context) {
    throw new Error("LegacyProjectContext Provider is missing");
  }

  return useStore(context, selector);
}
