import { useDetectionConfig } from "@/contexts/DetectionConfigContext";
import { DetectionFeature } from "@/detection/config/detectionFeatures";
import { DetectionValue } from "@/detection/core/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface FeatureNode {
  id: string;
  feature: string;
  value: string | boolean | undefined;
  type?: "string" | "boolean" | "array" | "object" | "number";
  parent: string;
  level: number;
  children: FeatureNode[];
  isExpanded: boolean;
  description?: string;
  error?: string;
  isTruncated?: boolean;
}

const formatValue = (
  val: unknown,
  error?: string
): string | boolean | undefined => {
  if (error) return undefined;
  if (val === null || val === undefined) return undefined;
  if (typeof val === "boolean") return val;

  // Handle arrays specifically
  if (Array.isArray(val)) {
    try {
      return JSON.stringify(val);
    } catch {
      return val.join(", ");
    }
  }

  // Handle objects
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }

  // Handle everything else
  return String(val);
};

// Calculate the parent path correctly for nested structures
const getParentPath = (path: string): string => {
  const parts = path.split(".");
  if (parts.length <= 1) return ""; // No parent if it's a top-level feature
  return parts.slice(0, -1).join("."); // Return everything except the last part
};

type ValueType = "string" | "number" | "boolean" | "object" | "array";

const getValueType = (value: unknown): ValueType => {
  if (value === null) return "object";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return typeof value as ValueType;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const useFeatureTree = (feature: DetectionFeature) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featureTree, setFeatureTree] = useState<FeatureNode[]>([]);
  const [flattenedNodes, setFlattenedNodes] = useState<FeatureNode[]>([]);
  const [hasError, setHasError] = useState(false);
  const { results, status, error, refresh, retry } = useDetectionConfig();

  const buildFeatureTree = (
    data: DetectionValue | Record<string, unknown>,
    feature: string,
    level: number,
    outputs?: Record<string, unknown>,
    error?: string
  ): FeatureNode[] => {
    const nodes: FeatureNode[] = [];

    // If data is not an object or is null, return empty array
    if (typeof data !== "object" || data === null) {
      return nodes;
    }

    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      const node: FeatureNode = {
        id: `${feature}-${key}`,
        feature: key,
        value: formatValue(value),
        type: getValueType(value),
        parent: feature,
        level,
        children: [],
        isExpanded: false,
        description: outputs?.[key] as string | undefined,
        error,
      };

      if (isRecord(value)) {
        node.children = buildFeatureTree(
          value,
          `${feature}-${key}`,
          level + 1,
          outputs?.[key] as Record<string, unknown> | undefined
        );
      }

      nodes.push(node);
    }

    return nodes;
  };

  const flattenTree = (nodes: FeatureNode[]): FeatureNode[] => {
    return nodes.flatMap((node) => {
      if (!node.children.length || !node.isExpanded) {
        return [node];
      }
      return [node, ...flattenTree(node.children)];
    });
  };

  const toggleNode = (id: string) => {
    const updateNodes = (nodes: FeatureNode[]): FeatureNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };

    const updated = updateNodes(featureTree);
    setFeatureTree(updated);
    setFlattenedNodes(flattenTree(updated));
  };

  const loadResults = async () => {
    setIsLoading(true);
    try {
      if (status === "error") {
        setHasError(true);
        toast.error(
          `Error loading results for ${feature.name}: ${error?.message}`
        );
        const tree = buildFeatureTree(
          {},
          feature.codeName,
          0,
          undefined,
          error?.message
        );
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
        return;
      }

      const result = results[feature.codeName];
      if (!result) {
        setHasError(true);
        toast.error(`No results found for ${feature.name}`);
        const tree = buildFeatureTree(
          {},
          feature.codeName,
          0,
          undefined,
          "No results available"
        );
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
        return;
      }

      // Extract the value from the result object
      const resultValue = result.value || result;
      const tree = buildFeatureTree(
        resultValue,
        feature.codeName,
        0,
        feature.outputs
      );
      setFeatureTree(tree);
      setFlattenedNodes(flattenTree(tree));
      setHasError(false);
    } catch (error) {
      setHasError(true);
      const errorMessage = (error as Error).message;
      toast.error(`Error loading results for ${feature.name}: ${errorMessage}`);
      const tree = buildFeatureTree(
        {},
        feature.codeName,
        0,
        undefined,
        errorMessage
      );
      setFeatureTree(tree);
      setFlattenedNodes(flattenTree(tree));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [feature.codeName, results, status, error]);

  return {
    isLoading,
    hasError,
    flattenedNodes,
    toggleNode,
    loadResults,
    refresh,
    retry,
  };
};
