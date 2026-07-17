import React, { createContext, useContext, useState } from "react";

export const STORES = [
  "Harapan Indah",
  "Mobeng Mustika Jaya",
  "Mobeng Hankam",
  "Mobeng Sunter",
  "Mobeng Duren Sawit",
  "Mobeng Jati Asih",
  "Mobeng Cileungsi",
];

interface StoreContextType {
  selectedStore: string;
  setSelectedStore: (store: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStoreState] = useState<string>(() => {
    return localStorage.getItem("mobeng_selected_store") || "";
  });

  const setSelectedStore = (store: string) => {
    setSelectedStoreState(store);
    localStorage.setItem("mobeng_selected_store", store);
  };

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
}
