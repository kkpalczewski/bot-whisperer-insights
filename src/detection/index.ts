import { libraries } from "./config/fingerprintingLibraries";
import { detectionFeaturesMapSchema} from "./config/detectionSchemaLoader";
import {
  DetectionInstance,
  DetectionOptions,
  DetectionResult,
  EvaluationState,
} from "./core/types";
import { Storage } from "./storage/interface";
import { loadDetectionCodes } from "./utils/detection-codes-manager";
import { loadAndEvaluate, refreshResults } from "./utils/evaluation-manager";
import { findFeatureInfo } from "./utils/featureLookup";

export type { DetectionResult } from "./core/types";

export interface FeatureMetadata {
  description?: string;
  abuseIndication?: string;
  exemplaryValues?: Array<string | boolean | number | object | Array<unknown>>;
}

export interface DetectionContextState {
  results: DetectionResult;
  status: "idle" | "loading" | "error";
  error: Error | null;
}

export interface DetectionContextActions {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

export interface DetectionModule {
  loadAndEvaluate: (storage: Storage) => Promise<{
    results: EvaluationState["results"];
    error: Error | null;
  }>;
  refreshResults: (storage: Storage) => Promise<{
    results: EvaluationState["results"];
    error: Error | null;
  }>;
  loadDetectionCodes: (storage: Storage) => Promise<Record<string, string>>;
  getFeatureMetadata: (featureFullKey: string) => FeatureMetadata;
  createContext: (options: DetectionOptions) => {
    getState: () => DetectionContextState;
    actions: DetectionContextActions;
  };
  getFeatures: () => typeof detectionFeaturesMapSchema;
  getLibraries: () => typeof libraries;
}

const createDetectionContext = (options: DetectionOptions) => {
  const detection = initDetection(options);
  let currentState: DetectionContextState = {
    results: {},
    status: "idle",
    error: null,
  };

  const getState = () => currentState;

  const setState = (newState: Partial<DetectionContextState>) => {
    currentState = { ...currentState, ...newState };
  };

  const loadAndEvaluateFeatures = async () => {
    setState({ status: "loading", error: null });
    try {
      const results = await detection.getResults();
      setState({ results, status: "idle" });
    } catch (error) {
      setState({
        error:
          error instanceof Error ? error : new Error("Failed to get results"),
        status: "error",
      });
    }
  };

  const refresh = async () => {
    setState({ status: "loading", error: null });
    try {
      const results = await detection.refresh();
      setState({ results, status: "idle" });
    } catch (error) {
      setState({
        error:
          error instanceof Error
            ? error
            : new Error("Failed to refresh results"),
        status: "error",
      });
    }
  };

  const retry = async () => {
    setState({ error: null });
    await loadAndEvaluateFeatures();
  };

  // Initial load
  loadAndEvaluateFeatures();

  return {
    getState,
    actions: { refresh, retry },
  };
};

export const detectionModule: DetectionModule = {
  loadAndEvaluate,
  refreshResults,
  loadDetectionCodes,
  getFeatureMetadata: (featureFullKey: string) => {
    const { description, abuseIndication, exemplaryValues } = findFeatureInfo(
      featureFullKey
    );
    return { description, abuseIndication, exemplaryValues };
  },
  createContext: createDetectionContext,
  getFeatures: () => detectionFeaturesMapSchema,
  getLibraries: () => libraries,
};

class Detection implements DetectionInstance {
  private storage: Storage;
  private cacheExpiry: number;
  private autoRefresh: boolean;

  constructor(options: DetectionOptions) {
    this.storage = options.storage;
    this.cacheExpiry = options.cacheExpiry ?? 24 * 60 * 60 * 1000; // 24 hours
    this.autoRefresh = options.autoRefresh ?? true;
  }

  async getResults(): Promise<DetectionResult> {
    const { results, error } = await loadAndEvaluate(this.storage);
    if (error) {
      throw error;
    }
    return results;
  }

  async refresh(): Promise<DetectionResult> {
    const { results, error } = await refreshResults(this.storage);
    if (error) {
      throw error;
    }
    return results;
  }

  clearCache(): void {
    this.storage.setItem("detection_results", "");
  }
}

/**
 * Initialize the detection module
 * @param options Configuration options
 * @returns Detection instance
 */
export function initDetection(options: DetectionOptions): DetectionInstance {
  return new Detection(options);
}
