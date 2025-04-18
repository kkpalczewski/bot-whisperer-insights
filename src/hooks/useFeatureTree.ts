
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
  isTruncated?: boolean;
  expectedType?: string;
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
  if (dependency) return dependency;
  return path.split('.')[0];
};

export const useFeatureTree = (feature: DetectionFeature) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featureTree, setFeatureTree] = useState<FeatureNode[]>([]);
  const [flattenedNodes, setFlattenedNodes] = useState<FeatureNode[]>([]);
  const [hasError, setHasError] = useState(false);

  const getExpectedType = (path: string = feature.codeName, outputs?: Record<string, any>): string | undefined => {
    if (path === feature.codeName) {
      return feature.type;
    }
    
    const parts = path.split('.');
    if (parts.length < 2) return undefined;
    
    // Get the last part of the path, which is the key
    const key = parts[parts.length - 1];
    
    // Get the parent path
    const parentPath = parts.slice(0, parts.length - 1).join('.');
    
    // If we have outputs for the parent, try to find the key in there
    if (outputs && key in outputs) {
      return outputs[key].type;
    }
    
    return undefined;
  };

  const buildFeatureTree = (
    value: any,
    path: string = feature.codeName,
    level: number = 0,
    outputs?: Record<string, any>,
    error?: string
  ): FeatureNode[] => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      const expectedType = getExpectedType(path, outputs);
      return [{
        id: path,
        feature: path,
        value: formatValue(value, error),
        parent: getParentName(path, feature.dependency),
        level,
        children: [],
        isExpanded: false,
        description: outputs?.description || feature.description,
        error,
        expectedType
      }];
    }

    return Object.entries(value).flatMap(([key, val]) => {
      const output = outputs?.[key];
      const currentPath = `${path}.${key}`;
      const expectedType = getExpectedType(currentPath, outputs);
      
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const children = buildFeatureTree(val, currentPath, level + 1, output?.outputs, error);
        return [{
          id: currentPath,
          feature: key,
          value: formatValue(val, error),
          parent: getParentName(path, feature.dependency),
          level,
          children,
          isExpanded: false,
          description: output?.description || (level === 0 ? feature.description : undefined),
          error,
          expectedType
        }];
      }
      
      return [{
        id: currentPath,
        feature: key,
        value: formatValue(val, error),
        parent: getParentName(path, feature.dependency),
        level,
        children: [],
        isExpanded: false,
        description: output?.description || (level === 0 ? feature.description : undefined),
        error,
        expectedType
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
        const tree = buildFeatureTree(result.value, feature.codeName, 0, feature.outputs, result.error);
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
      } else {
        const tree = buildFeatureTree(result.value, feature.codeName, 0, feature.outputs);
        setFeatureTree(tree);
        setFlattenedNodes(flattenTree(tree));
        setHasError(false);
      }
    } catch (error) {
      setHasError(true);
      const errorMessage = (error as Error).message;
      toast.error(`Error evaluating ${feature.name}: ${errorMessage}`);
      const tree = buildFeatureTree({}, feature.codeName, 0, feature.outputs, errorMessage);
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
