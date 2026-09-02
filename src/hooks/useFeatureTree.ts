import { useDetectionConfig } from "@/contexts/DetectionConfigContext";
import { DetectionValue } from "@/detection/core/types";
import {
  DetectionFeatureSchema,
  RootDetectionFeatureSchema,
} from "@/detection/types/detectionSchema";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FeatureNode } from "./types";

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

export const useFeatureTree = (feature: RootDetectionFeatureSchema) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featureTree, setFeatureTree] = useState<FeatureNode[]>([]);
  const [hasError, setHasError] = useState(false);
  const { results, status, error, refresh, retry } = useDetectionConfig();
  const expandedNodesRef = useRef<Set<string>>(new Set());

  const buildFeatureTree = (
    data: DetectionValue | Record<string, unknown>,
    feature: string,
    level: number,
    outputs?: Record<string, DetectionFeatureSchema>,
    error?: string
  ): FeatureNode[] => {
    const nodes: FeatureNode[] = [];

    if (typeof data !== "object" || data === null) {
      return nodes;
    }

    for (const [key, value] of Object.entries(data)) {
      const nodeId = `${feature}.${key}`;
      const node: FeatureNode = {
        fullKey: nodeId,
        featureKey: key,
        name: outputs?.[key]?.name ?? key,
        value: formatValue(value),
        type: outputs?.[key]?.type ?? getValueType(value),
        parentKey: feature,
        children: [],
        isExpanded: expandedNodesRef.current.has(nodeId),
        description: outputs?.[key]?.description ?? "",
        error,
        level,
        abuseIndication: outputs?.[key]?.abuseIndication ?? { bot: "" },
        exemplaryValues: outputs?.[key]?.exemplaryValues ?? [],
        isLeaf: outputs?.[key]?.isLeaf ?? false,
        rootKey: outputs?.[key]?.rootKey ?? "",
      };

      if (isRecord(value)) {
        node.children = buildFeatureTree(
          value,
          nodeId,
          level + 1,
          outputs?.[key]?.outputs as Record<string, DetectionFeatureSchema> | undefined
        );
      }

      nodes.push(node);
    }

    return nodes;
  };

  const toggleNode = (fullKey: string) => {
    const updateNodes = (nodes: FeatureNode[]): FeatureNode[] => {
      return nodes.map((node) => {
        if (node.fullKey === fullKey) {
          const newExpanded = !node.isExpanded;
          if (newExpanded) {
            expandedNodesRef.current.add(fullKey);
          } else {
            expandedNodesRef.current.delete(fullKey);
          }
          return { ...node, isExpanded: newExpanded };
        }
        if (node.children.length) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };

    setFeatureTree(updateNodes(featureTree));
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const errorTree = (message: string) =>
      buildFeatureTree({}, feature.fullKey, 0, undefined, message);

    let tree: FeatureNode[];
    let failed = false;
    try {
      if (status === "error") {
        failed = true;
        toast.error(`Error loading results for ${feature.name}: ${error?.message}`);
        tree = errorTree(error?.message ?? "Unknown error");
      } else {
        const result = results[feature.fullKey];
        if (!result) {
          failed = true;
          toast.error(`No results found for ${feature.name}`);
          tree = errorTree("No results available");
        } else {
          tree = buildFeatureTree(
            result.value ?? result,
            feature.fullKey,
            0,
            feature.outputs
          );
        }
      }
    } catch (err) {
      failed = true;
      const message = (err as Error).message;
      toast.error(`Error loading results for ${feature.name}: ${message}`);
      tree = errorTree(message);
    }

    if (cancelled) return;
    setHasError(failed);
    setFeatureTree(tree);
    setIsLoading(false);

    return () => {
      cancelled = true;
    };
    // buildFeatureTree is recreated each render but only depends on the values below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, results, status, error]);

  return {
    isLoading,
    hasError,
    featureTree,
    toggleNode,
    refresh,
    retry,
  };
};
