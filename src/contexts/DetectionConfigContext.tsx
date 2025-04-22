import { features } from "@/config/detectionFeatures";
import { DetectionResult } from "@/types/detection";
import { loadDetectionCodes } from "@/utils/detection-codes-manager";
import { LibraryDependency } from "@/utils/external-libraries/dependency-manager";
import { safeEvaluate } from "@/utils/library-manager";
import React, { createContext, useContext, useEffect, useState } from "react";

const RESULTS_KEY = "detection_results";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface DetectionConfigContextType {
  results: DetectionResult;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const DetectionConfigContext = createContext<
  DetectionConfigContextType | undefined
>(undefined);

export const DetectionConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [results, setResults] = useState<DetectionResult>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

        // Ensure the result has a timestamp and is an object
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
    try {
      // Check for valid cached results
      const cached = localStorage.getItem(RESULTS_KEY);
      if (cached) {
        const { results: cachedResults, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setResults(cachedResults);
          setIsLoading(false);
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
      setResults(newResults);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to evaluate features")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAndEvaluate();
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const newResults = await evaluateFeatures();
      const cacheData = {
        results: newResults,
        timestamp: Date.now(),
      };

      localStorage.setItem(RESULTS_KEY, JSON.stringify(cacheData));
      setResults(newResults);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to refresh results")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DetectionConfigContext.Provider
      value={{ results, isLoading, error, refresh }}
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
