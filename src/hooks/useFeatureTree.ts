import { useDetectionConfig } from "@/contexts/DetectionConfigContext";
import { DetectionValue } from "@/detection/core/types";
import {
  DetectionFeatureSchema,
  RootDetectionFeatureSchema,
} from "@/detection/types/detectionSchema";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FeatureNode } from "./types";

const formatValue = (val: unknown): string | boolean | undefined => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "boolean") return val;

  if (Array.isArray(val)) {
    try {
      return JSON.stringify(val);
    } catch {
      return val.join(", ");
    }
  }

  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }

  return String(val);
};

type ValueType = "string" | "number" | "boolean" | "object" | "array";

const getValueType = (value: unknown): ValueType => {
  if (value === null) return "object";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return typeof value as ValueType;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const buildFeatureTree = (
  data: DetectionValue | Record<string, unknown>,
  parentKey: string,
  level: number,
  expanded: ReadonlySet<string>,
  outputs?: Record<string, DetectionFeatureSchema>,
  error?: string
): FeatureNode[] => {
  if (typeof data !== "object" || data === null) return [];

  return Object.entries(data).map(([key, value]) => {
    const fullKey = `${parentKey}.${key}`;
    const schema = outputs?.[key];
    return {
      fullKey,
      featureKey: key,
      name: schema?.name ?? key,
      value: error ? undefined : formatValue(value),
      type: schema?.type ?? getValueType(value),
      parentKey,
      children: isRecord(value)
        ? buildFeatureTree(value, fullKey, level + 1, expanded, schema?.outputs)
        : [],
      isExpanded: expanded.has(fullKey),
      description: schema?.description ?? "",
      error,
      level,
      abuseIndication: schema?.abuseIndication ?? { bot: "" },
      exemplaryValues: schema?.exemplaryValues ?? [],
      isLeaf: schema?.isLeaf ?? false,
      rootKey: schema?.rootKey ?? "",
    };
  });
};

export const useFeatureTree = (feature: RootDetectionFeatureSchema) => {
  const { results, status, error, refresh, retry } = useDetectionConfig();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  const { featureTree, errorMessage } = useMemo(() => {
    if (status === "error") {
      return { featureTree: [] as FeatureNode[], errorMessage: error?.message ?? "Unknown error" };
    }
    const result = results[feature.fullKey];
    if (!result) {
      return { featureTree: [] as FeatureNode[], errorMessage: "No results available" };
    }
    return {
      featureTree: buildFeatureTree(
        result.value ?? result,
        feature.fullKey,
        0,
        expanded,
        feature.outputs
      ),
      errorMessage: undefined,
    };
  }, [feature, results, status, error, expanded]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(`${feature.name}: ${errorMessage}`);
    }
  }, [errorMessage, feature.name]);

  const toggleNode = useCallback((fullKey: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(fullKey)) {
        next.delete(fullKey);
      } else {
        next.add(fullKey);
      }
      return next;
    });
  }, []);

  return {
    isLoading: status === "loading",
    hasError: errorMessage !== undefined,
    featureTree,
    toggleNode,
    refresh,
    retry,
  };
};
