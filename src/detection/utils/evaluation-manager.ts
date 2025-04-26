import { rootDetectionFeaturesFlatSchema } from "@/detection/config/detectionSchemaLoader";
import {
  DetectionResult,
  EvaluationAction,
  EvaluationState,
} from "@/detection/core/types";
import { Storage } from "@/detection/storage/interface";
import { safeEvaluate } from "@/detection/utils/safe-evaluate";

export const RESULTS_KEY = "detection_results";
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const initialState: EvaluationState = {
  results: {},
  status: "idle",
  error: null,
};

export function evaluationReducer(
  state: EvaluationState,
  action: EvaluationAction
): EvaluationState {
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

export async function evaluateFeatures(): Promise<DetectionResult> {
  const evaluationResults: DetectionResult = {};

  for (const rootDetectionFeature of Object.values(rootDetectionFeaturesFlatSchema)) {
    try {
      const result = await safeEvaluate(
        rootDetectionFeature
      );

      const resultValue = result.value || {};
      evaluationResults[rootDetectionFeature.featureKey] = {
        ...(typeof resultValue === "object"
          ? resultValue
          : { value: resultValue }),
        timestamp: new Date().toISOString(),
        error: result.error,
      };
    } catch (err) {
      console.error(`Failed to evaluate ${rootDetectionFeature.featureKey}:`, err);
      evaluationResults[rootDetectionFeature.featureKey] = {
        error: err instanceof Error ? err.message : "Evaluation failed",
        timestamp: new Date().toISOString(),
      };
    }
  }

  return evaluationResults;
}

export async function loadAndEvaluate(storage: Storage): Promise<{
  results: DetectionResult;
  error: Error | null;
}> {
  try {
    // Check for valid cached results
    const cached = storage.getItem(RESULTS_KEY);
    if (cached) {
      const { results: cachedResults, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return { results: cachedResults, error: null };
      }
    }

    // Evaluate and cache new results
    const newResults = await evaluateFeatures();
    const cacheData = {
      results: newResults,
      timestamp: Date.now(),
    };

    storage.setItem(RESULTS_KEY, JSON.stringify(cacheData));
    return { results: newResults, error: null };
  } catch (err) {
    return {
      results: {},
      error:
        err instanceof Error ? err : new Error("Failed to evaluate features"),
    };
  }
}

export async function refreshResults(storage: Storage): Promise<{
  results: DetectionResult;
  error: Error | null;
}> {
  try {
    const newResults = await evaluateFeatures();
    const cacheData = {
      results: newResults,
      timestamp: Date.now(),
    };

    storage.setItem(RESULTS_KEY, JSON.stringify(cacheData));
    return { results: newResults, error: null };
  } catch (err) {
    return {
      results: {},
      error:
        err instanceof Error ? err : new Error("Failed to refresh results"),
    };
  }
}
