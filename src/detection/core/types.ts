import type { Storage } from "../storage/interface";

export type DetectionValue =
  | string
  | number
  | boolean
  | Record<string, unknown>;

export interface DetectionResult {
  [key: string]: {
    value?: DetectionValue;
    error?: string;
    timestamp: string;
  };
}

export interface EvaluationState {
  results: DetectionResult;
  status: "idle" | "loading" | "error";
  error: Error | null;
}

export interface DetectionOptions {
  /**
   * Storage implementation for caching results
   */
  storage: Storage;
}
