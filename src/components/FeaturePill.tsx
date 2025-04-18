
import React, { useState, useEffect } from 'react';
import { DetectionFeature, FeatureValue } from '@/config/detectionFeatures';
import { ChevronDown, Code, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { safeEvaluate } from '@/utils/library-manager';

interface FeaturePillProps {
  feature: DetectionFeature;
}

interface FormattedValue {
  display: string;
  raw: any;
  error?: string;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [value, setValue] = useState<FormattedValue>({ display: 'Evaluating...', raw: null });
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatValue = (val: any, type: string): FormattedValue => {
    try {
      if (val === null || val === undefined) {
        return { display: 'Not available', raw: null };
      }

      switch (type) {
        case 'array':
          return {
            display: Array.isArray(val) ? `[${val.length} items]` : String(val),
            raw: Array.isArray(val) ? val : [val]
          };
        case 'object':
          return {
            display: typeof val === 'object' ? `{${Object.keys(val).length} properties}` : String(val),
            raw: typeof val === 'object' ? val : { value: val }
          };
        case 'number':
          const num = Number(val);
          return {
            display: isNaN(num) ? 'Invalid number' : num.toString(),
            raw: isNaN(num) ? null : num
          };
        case 'string':
          return {
            display: String(val),
            raw: String(val)
          };
        case 'boolean':
          return {
            display: String(val),
            raw: val
          };
        default:
          return {
            display: JSON.stringify(val),
            raw: val
          };
      }
    } catch (err) {
      return {
        display: 'Error formatting value',
        raw: null,
        error: (err as Error).message
      };
    }
  };

  useEffect(() => {
    evaluateCode();
  }, []);

  const evaluateCode = async () => {
    setIsLoading(true);
    try {
      const result = await safeEvaluate(feature.code, feature.type, feature.dependency);
      
      if (result.error) {
        setHasError(true);
        const errorValue: FormattedValue = {
          display: `Error: ${result.error}`,
          raw: null,
          error: result.error
        };
        setValue(errorValue);
        console.error(`Error evaluating ${feature.name}:`, result.error);
      } else {
        // Handle nested features
        if (feature.outputs && typeof result.value === 'object') {
          const formattedOutputs = Object.entries(result.value || {}).reduce((acc, [key, outputValue]) => {
            const outputConfig = feature.outputs?.[key];
            if (outputConfig) {
              acc[key] = formatValue(outputValue, outputConfig.type).raw;
            } else {
              acc[key] = outputValue;
            }
            return acc;
          }, {} as Record<string, any>);
          
          setValue({
            display: formatNestedFeatureDisplay(formattedOutputs),
            raw: formattedOutputs
          });
          setHasError(false);
        } else {
          // Handle simple features
          const formattedResult = formatValue(result.value, feature.type);
          setValue(formattedResult);
          setHasError(false);
        }
      }
    } catch (error) {
      setHasError(true);
      const errorValue: FormattedValue = {
        display: `Error: ${(error as Error).message}`,
        raw: null,
        error: (error as Error).message
      };
      setValue(errorValue);
      toast.error(`Error evaluating ${feature.name}: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNestedFeatureDisplay = (nestedValues: Record<string, any>): string => {
    if (!nestedValues || Object.keys(nestedValues).length === 0) {
      return 'No data available';
    }
    
    // Format for compact display of nested features
    const keyValuePairs = Object.entries(nestedValues)
      .map(([key, val]) => {
        const displayVal = 
          val === null || val === undefined ? 'N/A' :
          typeof val === 'object' ? (Array.isArray(val) ? `[${val.length}]` : `{...}`) :
          String(val).length > 15 ? `${String(val).substring(0, 15)}...` : 
          String(val);
        
        return `${key}: ${displayVal}`;
      })
      .join(', ');
    
    return keyValuePairs.length > 60 
      ? `${keyValuePairs.substring(0, 60)}...` 
      : keyValuePairs;
  };

  const categoryColor: Record<string, string> = {
    browser: 'bg-blue-700/20 text-blue-400',
    network: 'bg-green-700/20 text-green-400',
    behavior: 'bg-purple-700/20 text-purple-400',
    hardware: 'bg-amber-700/20 text-amber-400',
    fingerprinting: 'bg-rose-700/20 text-rose-400'
  };

  const renderOutputValues = () => {
    if (!feature.outputs || !value.raw) return null;
    
    return (
      <div className="grid gap-2 mt-2">
        {Object.entries(feature.outputs).map(([key, output]) => (
          <div key={key} className="bg-gray-800/50 p-2 rounded flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-bold">{key}</code>
                <Badge variant="outline" className="text-xs">
                  {output.type}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">{output.description}</p>
            </div>
            <div className="font-mono text-xs bg-gray-900 px-2 py-1 rounded max-w-[50%] overflow-hidden text-ellipsis whitespace-nowrap">
              {value.raw[key] !== undefined ? 
                (typeof value.raw[key] === 'object' ? 
                  JSON.stringify(value.raw[key]).substring(0, 30) + "..." : 
                  String(value.raw[key])) : 
                'undefined'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-b border-gray-800 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-4 cursor-pointer space-y-0" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-[200px_120px_1fr] gap-4 items-center w-full">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate">
                  {hasError && <AlertTriangle size={14} className="inline text-yellow-500 mr-1" />}
                  {feature.name}
                  {feature.dependency && (
                    <Package size={14} className="inline text-blue-400 ml-1" />
                  )}
                </h3>
              </div>
              <Badge className={`${categoryColor[feature.category]} text-xs w-fit`}>
                {feature.category}
              </Badge>
              <div className="flex items-center justify-between w-full">
                <div className="font-mono text-xs bg-gray-800 px-2 py-1 rounded max-h-24 overflow-y-auto break-all">
                  {isLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : hasError ? (
                    <span className="text-rose-400">{value.display}</span>
                  ) : feature.outputs ? (
                    <span>{value.display}</span>
                  ) : (
                    <pre className="whitespace-pre-wrap">{value.display}</pre>
                  )}
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2 flex-shrink-0">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <code className="text-xs bg-gray-900 px-2 py-1 rounded">{feature.codeName}</code>
              <code className="text-xs bg-gray-900 px-2 py-1 rounded">{feature.type}</code>
              {feature.dependency && (
                <Badge variant="outline" className="text-xs">
                  Requires: {feature.dependency}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">{feature.description}</p>
            
            {feature.outputs && renderOutputValues()}
            
            <div className="bg-gray-800 p-3 rounded flex items-start gap-2">
              <Code size={16} className="mt-1 text-gray-400" />
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
                {feature.code}
              </pre>
            </div>
            
            {hasError && (
              <div className="bg-rose-900/20 border border-rose-800 p-3 rounded text-xs text-rose-300">
                <strong>Error:</strong> {value.error}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
