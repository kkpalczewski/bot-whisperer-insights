import { DetectionFeature } from "@/config/detectionFeatures";
import { safeEvaluate } from "@/utils/library-manager";
import { useState } from "react";
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
  val: any,
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

export const useFeatureTree = (feature: DetectionFeature) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featureTree, setFeatureTree] = useState<FeatureNode[]>([]);
  const [flattenedNodes, setFlattenedNodes] = useState<FeatureNode[]>([]);
  const [hasError, setHasError] = useState(false);

  const buildFeatureTree = (
    value: any,
    path: string = feature.codeName,
    level: number = 0,
    outputs?: Record<string, any>,
    error?: string
  ): FeatureNode[] => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [
        {
          id: path,
          feature: path.split(".").pop() || path,
          value: formatValue(value, error),
          type: feature.type,
          parent: getParentPath(path),
          level,
          children: [],
          isExpanded: false,
          description: outputs?.description || feature.description,
          error,
        },
      ];
    }

    return Object.entries(value).flatMap(([key, val]) => {
      const output = outputs?.[key];
      const currentPath = `${path}.${key}`;
      // Determine the type from output configuration
      const dataType =
        output?.type || (Array.isArray(val) ? "array" : typeof val);

      if (val && typeof val === "object" && !Array.isArray(val)) {
        const children = buildFeatureTree(
          val,
          currentPath,
          level + 1,
          output?.outputs,
          error
        );
        return [
          {
            id: currentPath,
            feature: key,
            value: formatValue(val, error),
            type: dataType,
            parent: path, // Parent is the current path without the feature name
            level,
            children,
            isExpanded: false,
            description:
              output?.description ||
              (level === 0 ? feature.description : undefined),
            error,
          },
        ];
      }

      return [
        {
          id: currentPath,
          feature: key,
          value: formatValue(val, error),
          type: dataType,
          parent: path, // Parent is the current path without the feature name
          level,
          children: [],
          isExpanded: false,
          description:
            output?.description ||
            (level === 0 ? feature.description : undefined),
          error,
        },
      ];
    });
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

  const evaluateCode = async () => {
    setIsLoading(true);
    try {
      const result = await safeEvaluate(
        feature.code,
        feature.type,
        feature.dependency
      );

      if (result.error) {
        setHasError(true);
        toast.error(`Error evaluating ${feature.name}: ${result.error}`);
        const tree = buildFeatureTree(
          result.value,
          feature.codeName,
          0,
          undefined,
          result.error
        );
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
      } else {
        const tree = buildFeatureTree(result.value);
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
        setHasError(false);
      }
    } catch (error) {
      setHasError(true);
      const errorMessage = (error as Error).message;
      toast.error(`Error evaluating ${feature.name}: ${errorMessage}`);
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

  return {
    isLoading,
    hasError,
    flattenedNodes,
    toggleNode,
    evaluateCode,
  };
};
