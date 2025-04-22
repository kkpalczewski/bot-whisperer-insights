import {
  DetectionInstance,
  DetectionOptions,
  DetectionResult,
  EvaluationState,
} from "./core/types";
import { Storage } from "./storage/interface";
import { loadDetectionCodes } from "./utils/detection-codes-manager";
import { loadAndEvaluate, refreshResults } from "./utils/evaluation-manager";

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
}

export const detectionModule: DetectionModule = {
  loadAndEvaluate,
  refreshResults,
  loadDetectionCodes,
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
