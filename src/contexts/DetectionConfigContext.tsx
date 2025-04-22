import { LoadingIndicator } from "@/components/LoadingIndicator";
import {
  DetectionContextState,
  detectionModule,
  DetectionResult,
} from "@/detection";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

const localStorageImpl = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  setItem: (key: string, value: string): void =>
    localStorage.setItem(key, value),
};

const detectionOptions = {
  storage: localStorageImpl,
  autoRefresh: true,
};

interface DetectionConfigContextType {
  results: DetectionResult;
  status: "idle" | "loading" | "error";
  error: Error | null;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

type ReducerAction = {
  type: "SET_STATE";
  payload: DetectionContextState;
};

const DetectionConfigContext = createContext<
  DetectionConfigContextType | undefined
>(undefined);

export const DetectionConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getState, actions } = detectionModule.createContext(detectionOptions);
  const stateRef = useRef(getState());

  const [contextState, dispatch] = useReducer(
    (
      state: Omit<DetectionConfigContextType, "refresh" | "retry">,
      action: ReducerAction
    ) => {
      switch (action.type) {
        case "SET_STATE":
          return { ...state, ...action.payload };
        default:
          return state;
      }
    },
    stateRef.current
  );

  useEffect(() => {
    const checkForUpdates = () => {
      const newState = getState();
      if (newState !== stateRef.current) {
        stateRef.current = newState;
        dispatch({ type: "SET_STATE", payload: newState });
      }
    };

    // Check for updates periodically
    const intervalId = setInterval(checkForUpdates, 100);

    return () => clearInterval(intervalId);
  }, [getState]);

  if (
    contextState.status === "loading" ||
    (contextState.status === "idle" &&
      Object.keys(contextState.results).length === 0)
  ) {
    return <LoadingIndicator />;
  }

  return (
    <DetectionConfigContext.Provider
      value={{
        ...contextState,
        refresh: actions.refresh,
        retry: actions.retry,
      }}
    >
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
