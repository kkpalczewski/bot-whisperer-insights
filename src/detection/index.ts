import { libraries } from "./config/fingerprintingLibraries";
import { detectionFeaturesMapSchema } from "./config/detectionSchemaLoader";
import {
  DetectionOptions,
  DetectionResult,
  EvaluationState,
} from "./core/types";
import { RESULTS_KEY, loadAndEvaluate, refreshResults } from "./utils/evaluation-manager";
import { findFeatureInfo } from "./utils/featureLookup";

export type { EvaluationState } from "./core/types";

export interface FeatureMetadata {
  description?: string;
  abuseIndication?: { bot: string };
  exemplaryValues?: unknown[];
}

export interface DetectionStore {
  getState: () => EvaluationState;
  subscribe: (listener: () => void) => () => void;
  /** Evaluate (or load from cache) if nothing has been loaded yet. */
  load: () => Promise<void>;
  /** Discard the cache and re-evaluate every rule. */
  refresh: () => Promise<void>;
  /** Re-run the initial load after an error. */
  retry: () => Promise<void>;
}

/**
 * Creates an observable store around the evaluation pipeline. Nothing runs
 * until `load()` is called, so the caller controls when work starts.
 */
const createDetectionStore = (options: DetectionOptions): DetectionStore => {
  let state: EvaluationState = { results: {}, status: "idle", error: null };
  const listeners = new Set<() => void>();

  const setState = (partial: Partial<EvaluationState>) => {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener());
  };

  const run = async (
    evaluate: () => Promise<{ results: DetectionResult; error: Error | null }>
  ) => {
    if (state.status === "loading") return;
    setState({ status: "loading", error: null });
    const { results, error } = await evaluate();
    if (error) {
      setState({ status: "error", error });
    } else {
      setState({ results, status: "idle" });
    }
  };

  const load = () => run(() => loadAndEvaluate(options.storage));

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    refresh: () => {
      options.storage.removeItem(RESULTS_KEY);
      return run(() => refreshResults(options.storage));
    },
    retry: load,
  };
};

export const detectionModule = {
  createStore: createDetectionStore,
  getFeatureMetadata: (featureFullKey: string): FeatureMetadata => {
    try {
      const { description, abuseIndication, exemplaryValues } =
        findFeatureInfo(featureFullKey);
      return { description, abuseIndication, exemplaryValues };
    } catch {
      return {};
    }
  },
  getFeatures: () => detectionFeaturesMapSchema,
  getLibraries: () => libraries,
};
