import React, { useState, useEffect } from 'react';
import { DetectionFeature, FeatureValue } from '@/config/detectionFeatures';
import { Code, AlertTriangle, Package, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { safeEvaluate } from '@/utils/library-manager';
import { FeatureTableRow } from './FeatureTableRow';

interface FeaturePillProps {
  feature: DetectionFeature;
}

interface FeatureNode {
  id: string;
  feature: string;
  value: string;
  parent: string;
  level: number;
  children: FeatureNode[];
  isExpanded: boolean;
  description?: string;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featureTree, setFeatureTree] = useState<FeatureNode[]>([]);
  const [flattenedNodes, setFlattenedNodes] = useState<FeatureNode[]>([]);
  const [hasError, setHasError] = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);

  const formatValue = (val: any): string | boolean => {
    if (val === null || val === undefined) return 'Not available';
    if (typeof val === 'boolean') return val; // Return native boolean
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const buildFeatureTree = (
    value: any,
    path: string = feature.codeName,
    level: number = 0,
    outputs?: Record<string, FeatureValue>
  ): FeatureNode[] => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return [{
        id: path,
        feature: path,
        value: formatValue(value),
        parent: path.split('.')[0],
        level,
        children: [],
        isExpanded: false,
        description: outputs?.description || undefined
      }];
    }

    return Object.entries(value).flatMap(([key, val]) => {
      const output = outputs?.[key];
      const currentPath = `${path}.${key}`;
      
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const children = buildFeatureTree(val, currentPath, level + 1, output?.outputs);
        const node: FeatureNode = {
          id: currentPath,
          feature: currentPath,
          value: Array.isArray(val) ? formatValue(val) : 'Object',
          parent: path.split('.')[0],
          level,
          children,
          isExpanded: false,
          description: output?.description || undefined
        };
        return [node];
      }
      
      return [{
        id: currentPath,
        feature: currentPath,
        value: formatValue(val),
        parent: path.split('.')[0],
        level,
        children: [],
        isExpanded: false,
        description: output?.description || undefined
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
        const errorNode: FeatureNode = {
          id: feature.codeName,
          feature: feature.codeName,
          value: `Error: ${result.error}`,
          parent: feature.codeName.split('.')[0],
          level: 0,
          children: [],
          isExpanded: false,
          description: undefined
        };
        setFeatureTree([errorNode]);
        setFlattenedNodes([errorNode]);
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
      const errorNode: FeatureNode = {
        id: feature.codeName,
        feature: feature.codeName,
        value: `Error: ${errorMessage}`,
        parent: feature.codeName.split('.')[0],
        level: 0,
        children: [],
        isExpanded: false,
        description: undefined
      };
      setFeatureTree([errorNode]);
      setFlattenedNodes([errorNode]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    evaluateCode();
  }, []);

  return (
    <Card className="border-b border-gray-800 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <CardHeader className="p-4 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasError && <AlertTriangle size={16} className="text-yellow-500" />}
            <h3 className="text-sm font-medium">
              {feature.name}
              {feature.dependency && <Package size={14} className="inline text-blue-400 ml-1" />}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {feature.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{feature.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => setCodeVisible(!codeVisible)}
            >
              {codeVisible ? 'Hide code' : 'Show code'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 pt-0 space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-800">
              <TableHead className="w-1/2 font-medium text-xs">Feature</TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-1/3 font-medium text-xs">Value</TableHead>
              <TableHead className="w-1/6 font-medium text-xs">Parent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flattenedNodes.map((node) => (
              <FeatureTableRow
                key={node.id}
                feature={node.feature}
                value={node.value}
                parent={node.parent}
                isExpanded={node.isExpanded}
                hasChildren={node.children.length > 0}
                onToggle={() => toggleNode(node.id)}
                level={node.level}
              />
            ))}
            {flattenedNodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                  {isLoading ? 'Loading features...' : 'No features found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {codeVisible && (
          <div className={`${hasError ? 'bg-rose-900/20 border border-rose-800' : 'bg-gray-800'} p-2 rounded flex items-start gap-2`}>
            <Code size={16} className="mt-1 text-gray-400" />
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
              {feature.code}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
