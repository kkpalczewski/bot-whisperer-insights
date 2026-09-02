import { LoadingIndicator } from "@/components/LoadingIndicator";
import { detectionModule, DetectionStore, EvaluationState } from "@/detection";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

const localStorageImpl = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  setItem: (key: string, value: string): void =>
    localStorage.setItem(key, value),
  removeItem: (key: string): void => localStorage.removeItem(key),
};

interface DetectionConfigContextType extends EvaluationState {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

const DetectionConfigContext = createContext<
  DetectionConfigContextType | undefined
>(undefined);

export const DetectionConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const storeRef = useRef<DetectionStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = detectionModule.createStore({ storage: localStorageImpl });
  }
  const store = storeRef.current;

  const state = useSyncExternalStore(store.subscribe, store.getState);

  useEffect(() => {
    store.load();
  }, [store]);

  const value = useMemo<DetectionConfigContextType>(
    () => ({ ...state, refresh: store.refresh, retry: store.retry }),
    [state, store]
  );

  const hasResults = Object.keys(state.results).length > 0;
  if (!hasResults && state.status !== "error") {
    return <LoadingIndicator />;
  }

  return (
    <DetectionConfigContext.Provider value={value}>
      {children}
    </DetectionConfigContext.Provider>
  );
};

export const useDetectionConfig = () => {
  const context = useContext(DetectionConfigContext);
  if (context === undefined) {
    throw new Error(
      "useDetectionConfig must be used within a DetectionConfigProvider"
    );
  }
  return context;
};
