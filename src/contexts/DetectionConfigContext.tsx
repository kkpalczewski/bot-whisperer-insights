import { features } from "@/config/detectionFeatures";
import { DetectionResult } from "@/types/detection";
import { loadDetectionCodes } from "@/utils/detection-codes-manager";
import { LibraryDependency } from "@/utils/external-libraries/dependency-manager";
import { safeEvaluate } from "@/utils/library-manager";
import React, { createContext, useContext, useEffect, useReducer } from "react";

const RESULTS_KEY = "detection_results";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface DetectionConfigState {
  results: DetectionResult;
  status: "idle" | "loading" | "error";
  error: Error | null;
}

type DetectionConfigAction =
  | { type: "START_LOADING" }
  | { type: "SET_RESULTS"; payload: DetectionResult }
  | { type: "SET_ERROR"; payload: Error }
  | { type: "CLEAR_ERROR" };

const initialState: DetectionConfigState = {
  results: {},
  status: "idle",
  error: null,
};

function reducer(
  state: DetectionConfigState,
  action: DetectionConfigAction
): DetectionConfigState {
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

interface DetectionConfigContextType extends DetectionConfigState {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

const DetectionConfigContext = createContext<
  DetectionConfigContextType | undefined
>(undefined);

export const DetectionConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Load detection codes when the component mounts
    loadDetectionCodes().catch(console.error);
  }, []);

  const evaluateFeatures = async (): Promise<DetectionResult> => {
    const evaluationResults: DetectionResult = {};

    for (const feature of features) {
      try {
        const result = await safeEvaluate(
          feature.code,
          feature.type,
          feature.dependency as LibraryDependency | undefined,
          feature.outputs
        );

        const resultValue = result.value || {};
        evaluationResults[feature.codeName] = {
          ...(typeof resultValue === "object"
            ? resultValue
            : { value: resultValue }),
          timestamp: new Date().toISOString(),
          error: result.error,
        };
      } catch (err) {
        console.error(`Failed to evaluate ${feature.codeName}:`, err);
        evaluationResults[feature.codeName] = {
          error: err instanceof Error ? err.message : "Evaluation failed",
          timestamp: new Date().toISOString(),
        };
      }
    }

    return evaluationResults;
  };

  const loadAndEvaluate = async () => {
    dispatch({ type: "START_LOADING" });

    try {
      // Check for valid cached results
      const cached = localStorage.getItem(RESULTS_KEY);
      if (cached) {
        const { results: cachedResults, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          dispatch({ type: "SET_RESULTS", payload: cachedResults });
          return;
        }
      }

      // Evaluate and cache new results
      const newResults = await evaluateFeatures();
      const cacheData = {
        results: newResults,
        timestamp: Date.now(),
      };

      localStorage.setItem(RESULTS_KEY, JSON.stringify(cacheData));
      dispatch({ type: "SET_RESULTS", payload: newResults });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload:
          err instanceof Error ? err : new Error("Failed to evaluate features"),
      });
    }
  };

  useEffect(() => {
    loadAndEvaluate();
  }, []);

  const refresh = async () => {
    dispatch({ type: "START_LOADING" });
    try {
      const newResults = await evaluateFeatures();
      const cacheData = {
        results: newResults,
        timestamp: Date.now(),
      };

      localStorage.setItem(RESULTS_KEY, JSON.stringify(cacheData));
      dispatch({ type: "SET_RESULTS", payload: newResults });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload:
          err instanceof Error ? err : new Error("Failed to refresh results"),
      });
    }
  };

  const retry = async () => {
    dispatch({ type: "CLEAR_ERROR" });
    await loadAndEvaluate();
  };

  // Don't render children until we have results
  if (
    state.status === "loading" ||
    (state.status === "idle" && Object.keys(state.results).length === 0)
  ) {
    return null;
  }

  return (
    <DetectionConfigContext.Provider
      value={{
        ...state,
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
