import { rootDetectionFeaturesFlatSchema } from "@/detection/config/detectionSchemaLoader";
import { DetectionResult, DetectionValue } from "@/detection/core/types";
import { Storage } from "@/detection/storage/interface";
import { safeEvaluate } from "@/detection/utils/safe-evaluate";

// Bumped when the stored shape changes so stale caches are ignored.
export const RESULTS_KEY = "detection_results_v2";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Evaluates every root rule concurrently. A single rule failing or timing out
 * is recorded on that rule's entry and never blocks the others.
 */
async function evaluateFeatures(): Promise<DetectionResult> {
  const roots = Object.values(rootDetectionFeaturesFlatSchema);
  const settled = await Promise.allSettled(roots.map((root) => safeEvaluate(root)));

  const evaluationResults: DetectionResult = {};
  roots.forEach((root, index) => {
    const outcome = settled[index];
    const timestamp = new Date().toISOString();

    if (outcome.status === "rejected") {
      const err = outcome.reason;
      console.error(`Failed to evaluate ${root.featureKey}:`, err);
      evaluationResults[root.featureKey] = {
        error: err instanceof Error ? err.message : "Evaluation failed",
        timestamp,
      };
      return;
    }

    evaluationResults[root.featureKey] = {
      ...(outcome.value.value != null ? { value: outcome.value.value as DetectionValue } : {}),
      ...(outcome.value.error ? { error: outcome.value.error } : {}),
      timestamp,
    };
  });

  return evaluationResults;
}

const evaluateAndCache = async (storage: Storage): Promise<DetectionResult> => {
  const newResults = await evaluateFeatures();
  storage.setItem(
    RESULTS_KEY,
    JSON.stringify({ results: newResults, timestamp: Date.now() })
  );
  return newResults;
};

export async function loadAndEvaluate(storage: Storage): Promise<{
  results: DetectionResult;
  error: Error | null;
}> {
  try {
    // Drop the pre-v2 cache, which used a different result shape
    storage.removeItem("detection_results");

    // Check for valid cached results
    const cached = storage.getItem(RESULTS_KEY);
    if (cached) {
      const { results: cachedResults, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return { results: cachedResults, error: null };
      }
    }

    return { results: await evaluateAndCache(storage), error: null };
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
    return { results: await evaluateAndCache(storage), error: null };
  } catch (err) {
    return {
      results: {},
      error:
        err instanceof Error ? err : new Error("Failed to refresh results"),
    };
  }
}
