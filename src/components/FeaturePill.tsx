import React, { useState, useEffect } from 'react';
import { DetectionFeature, FeatureValue } from '@/config/detectionFeatures';
import { ChevronDown, Code, AlertTriangle, Package, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { safeEvaluate } from '@/utils/library-manager';
import { FeatureTableRow } from './FeatureTableRow';

interface FeaturePillProps {
  feature: DetectionFeature;
}

interface FormattedFeature {
  codeName: string;
  fieldName: string;
  value: string;
  parent: string;
  description?: string;
  error?: string;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState<FormattedFeature[]>([]);
  const [hasError, setHasError] = useState(false);

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return 'Not available';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const flattenFeatures = (
    value: any, 
    parentCodeName: string, 
    parentName: string, 
    outputs?: Record<string, FeatureValue>
  ): FormattedFeature[] => {
    if (!value || typeof value !== 'object') {
      return [{
        codeName: parentCodeName,
        fieldName: parentName,
        value: formatValue(value),
        parent: parentCodeName.split('.')[0]
      }];
    }

    return Object.entries(value).flatMap(([key, val]) => {
      const output = outputs?.[key];
      const currentCodeName = `${parentCodeName}.${key}`;
      const currentName = output?.name || key;
      
      if (Array.isArray(val)) {
        return [{
          codeName: currentCodeName,
          fieldName: currentName,
          value: formatValue(val),
          parent: parentCodeName.split('.')[0],
          description: output?.description
        }];
      }

      if (val && typeof val === 'object' && output?.outputs) {
        return flattenFeatures(val, currentCodeName, currentName, output.outputs);
      }

      return [{
        codeName: currentCodeName,
        fieldName: currentName,
        value: formatValue(val),
        parent: parentCodeName.split('.')[0],
        description: output?.description
      }];
    });
  };

  const evaluateCode = async () => {
    setIsLoading(true);
    try {
      const result = await safeEvaluate(feature.code, feature.type, feature.dependency);
      
      if (result.error) {
        setHasError(true);
        toast.error(`Error evaluating ${feature.name}: ${result.error}`);
        setFeatures([{
          codeName: feature.codeName,
          fieldName: feature.name,
          value: `Error: ${result.error}`,
          parent: feature.codeName,
          error: result.error
        }]);
      } else {
        const flatFeatures = flattenFeatures(result.value, feature.codeName, feature.name, feature.outputs);
        setFeatures(flatFeatures);
        setHasError(false);
      }
    } catch (error) {
      setHasError(true);
      const errorMessage = (error as Error).message;
      toast.error(`Error evaluating ${feature.name}: ${errorMessage}`);
      setFeatures([{
        codeName: feature.codeName,
        fieldName: feature.name,
        value: `Error: ${errorMessage}`,
        parent: feature.codeName,
        error: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    evaluateCode();
  }, []);

  const previewFeature = features[0];
  
  return (
    <Card className="border-b border-gray-800 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-2 cursor-pointer space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-full">
              <h3 className="text-sm font-medium min-w-[200px]">
                {hasError && <AlertTriangle size={14} className="inline text-yellow-500 mr-1" />}
                {feature.name}
                {feature.dependency && <Package size={14} className="inline text-blue-400 ml-1" />}
              </h3>
              
              <Table>
                <TableBody>
                  {previewFeature && (
                    <FeatureTableRow
                      codeName={previewFeature.codeName}
                      fieldName={previewFeature.fieldName}
                      value={previewFeature.value}
                      parent={previewFeature.parent}
                    />
                  )}
                </TableBody>
              </Table>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-3 pt-0 space-y-2">
            {feature.description && (
              <p className="text-sm text-gray-400">{feature.description}</p>
            )}
            
            <Table>
              <TableBody>
                {features.map((feat, index) => (
                  <FeatureTableRow
                    key={index}
                    codeName={feat.codeName}
                    fieldName={feat.fieldName}
                    value={feat.value}
                    parent={feat.parent}
                    isExpanded={true}
                  />
                ))}
              </TableBody>
            </Table>

            {hasError ? (
              <div className="bg-rose-900/20 border border-rose-800 p-2 rounded text-xs text-rose-300">
                <strong>Error:</strong> {features[0]?.error}
              </div>
            ) : (
              <div className="bg-gray-800 p-2 rounded flex items-start gap-2">
                <Code size={16} className="mt-1 text-gray-400" />
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
                  {feature.code}
                </pre>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
