import { useDetectionConfig } from "@/contexts/DetectionConfigContext";
import { RootDetectionFeatureSchema } from "@/detection/types/detectionSchema";
import { DetectionValue } from "@/detection/core/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FeatureNode } from "./types";
import { DetectionFeatureSchema } from "@/detection/types/detectionSchema";

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
  const [flattenedNodes, setFlattenedNodes] = useState<FeatureNode[]>([]);
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

    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      const nodeId = level === 0 ? `${feature}.${key}` : `${feature}.${key}`;
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

  const flattenTree = (nodes: FeatureNode[]): FeatureNode[] => {
    return nodes.flatMap((node) => {
      if (!node.children.length || !node.isExpanded) {
        return [node];
      }
      return [node, ...flattenTree(node.children)];
    });
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
          feature.fullKey,
          0,
          undefined,
          error?.message
        );
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
        return;
      }

      const result = results[feature.fullKey];
      if (!result) {
        setHasError(true);
        toast.error(`No results found for ${feature.name}`);
        const tree = buildFeatureTree(
          {},
          feature.fullKey,
          0,
          undefined,
          "No results available"
        );
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
        return;
      }

      const resultValue = result.value || result;
      const tree = buildFeatureTree(
        resultValue,
        feature.fullKey,
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
        feature.fullKey,
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
  }, [feature.fullKey]);

  return {
    isLoading,
    hasError,
    featureTree,
    flattenedNodes,
    toggleNode,
    loadResults,
    refresh,
    retry,
  };
};
