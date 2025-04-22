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

export type EvaluationAction =
  | { type: "START_LOADING" }
  | { type: "SET_RESULTS"; payload: DetectionResult }
  | { type: "SET_ERROR"; payload: Error }
  | { type: "CLEAR_ERROR" };

export interface DetectionOptions {
  /**
   * Storage implementation for caching results
   */
  storage: Storage;

  /**
   * Cache expiration time in milliseconds
   * @default 24 hours
   */
  cacheExpiry?: number;

  /**
   * Whether to automatically refresh results when they expire
   * @default true
   */
  autoRefresh?: boolean;
}

export interface DetectionInstance {
  /**
   * Get current detection results
   */
  getResults(): Promise<DetectionResult>;

  /**
   * Force refresh of detection results
   */
  refresh(): Promise<DetectionResult>;

  /**
   * Clear cached results
   */
  clearCache(): void;
}
