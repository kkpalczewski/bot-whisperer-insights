
import { useState } from 'react';
import { DetectionFeature } from '@/config/detectionFeatures';
import { safeEvaluate } from '@/utils/library-manager';
import { toast } from 'sonner';

export interface FeatureNode {
  id: string;
  feature: string;
  value: string | boolean | undefined;
  parent: string;
  level: number;
  children: FeatureNode[];
  isExpanded: boolean;
  description?: string;
  error?: string;
}

const formatValue = (val: any, error?: string): string | boolean | undefined => {
  if (error) return undefined;
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const getParentName = (path: string, dependency?: string): string => {
  if (dependency) return 'fingerprint_js';
  return path.split('.')[0];
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
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [{
        id: path,
        feature: path,
        value: formatValue(value, error),
        parent: getParentName(path, feature.dependency),
        level,
        children: [],
        isExpanded: false,
        description: outputs?.description,
        error
      }];
    }

    return Object.entries(value).flatMap(([key, val]) => {
      const output = outputs?.[key];
      const currentPath = `${path}.${key}`;
      
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const children = buildFeatureTree(val, currentPath, level + 1, output?.outputs, error);
        return [{
          id: currentPath,
          feature: currentPath,
          value: formatValue(val, error),
          parent: getParentName(path, feature.dependency),
          level,
          children,
          isExpanded: false,
          description: output?.description,
          error
        }];
      }
      
      return [{
        id: currentPath,
        feature: currentPath,
        value: formatValue(val, error),
        parent: getParentName(path, feature.dependency),
        level,
        children: [],
        isExpanded: false,
        description: output?.description,
        error
      }];
    });
  };

  const flattenTree = (nodes: FeatureNode[]): FeatureNode[] => {
    return nodes.flatMap(node => {
      if (!node.children.length || !node.isExpanded) {
        return [node];
      }
      return [node, ...flattenTree(node.children)];
    });
  };

  const toggleNode = (id: string) => {
    const updateNodes = (nodes: FeatureNode[]): FeatureNode[] => {
      return nodes.map(node => {
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
      const result = await safeEvaluate(feature.code, feature.type, feature.dependency);
      
      if (result.error) {
        setHasError(true);
        toast.error(`Error evaluating ${feature.name}: ${result.error}`);
        const tree = buildFeatureTree(result.value, feature.codeName, 0, undefined, result.error);
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
      const tree = buildFeatureTree({}, feature.codeName, 0, undefined, errorMessage);
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
    evaluateCode
  };
};
