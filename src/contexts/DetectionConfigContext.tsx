import { LoadingIndicator } from "@/components/LoadingIndicator";
import { initDetection } from "@/detection";
import {
  DetectionInstance,
  DetectionOptions,
  DetectionResult,
} from "@/detection/core/types";
import type { Storage } from "@/detection/storage/interface";
import React, { createContext, useContext, useEffect, useReducer } from "react";

const localStorageImpl: Storage = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  setItem: (key: string, value: string): void =>
    localStorage.setItem(key, value),
};

const detectionOptions: DetectionOptions = {
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

const DetectionConfigContext = createContext<
  DetectionConfigContextType | undefined
>(undefined);

const initialState: Omit<DetectionConfigContextType, "refresh" | "retry"> = {
  results: {},
  status: "idle",
  error: null,
};

function reducer(
  state: Omit<DetectionConfigContextType, "refresh" | "retry">,
  action:
    | { type: "START_LOADING" }
    | { type: "SET_RESULTS"; payload: DetectionResult }
    | { type: "SET_ERROR"; payload: Error }
    | { type: "CLEAR_ERROR" }
) {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, status: "loading", error: null };
    case "SET_RESULTS":
      return { ...state, results: action.payload, status: "idle" };
    case "SET_ERROR":
      return { ...state, error: action.payload, status: "error" };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export const DetectionConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const detection = React.useRef<DetectionInstance | null>(null);

  useEffect(() => {
    detection.current = initDetection(detectionOptions);
    loadAndEvaluateFeatures();
  }, []);

  const loadAndEvaluateFeatures = async () => {
    if (!detection.current) return;

    dispatch({ type: "START_LOADING" });
    try {
      const results = await detection.current.getResults();
      dispatch({ type: "SET_RESULTS", payload: results });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error : new Error("Failed to get results"),
      });
    }
  };

  const refresh = async () => {
    if (!detection.current) return;

    dispatch({ type: "START_LOADING" });
    try {
      const results = await detection.current.refresh();
      dispatch({ type: "SET_RESULTS", payload: results });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error
            : new Error("Failed to refresh results"),
      });
    }
  };

  const retry = async () => {
    dispatch({ type: "CLEAR_ERROR" });
    await loadAndEvaluateFeatures();
  };

  if (
    state.status === "loading" ||
    (state.status === "idle" && Object.keys(state.results).length === 0)
  ) {
    return <LoadingIndicator />;
  }

  return (
    <DetectionConfigContext.Provider
      value={{
        results: state.results,
        status: state.status as "idle" | "loading" | "error",
        error: state.error,
        refresh,
        retry,
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
