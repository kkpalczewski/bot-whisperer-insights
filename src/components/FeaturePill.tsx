import React, { useState, useEffect } from 'react';
import { DetectionFeature, FeatureValue } from '@/config/detectionFeatures';
import { ChevronDown, Code, AlertTriangle, Package, Info, Hash, Type, List, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'number':
      return <Hash className="h-3 w-3 text-blue-400" />;
    case 'array':
      return <List className="h-3 w-3 text-green-400" />;
    case 'object':
      return <FileJson className="h-3 w-3 text-purple-400" />;
    default:
      return <Type className="h-3 w-3 text-gray-400" />;
  }
};

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
        case 'boolean':
          return {
            display: val ? 'Yes' : 'No',
            raw: val
          };
        case 'array':
          if (!Array.isArray(val)) {
            return {
              display: 'Invalid array',
              raw: null,
              error: 'Expected array but got ' + typeof val
            };
          }
          return {
            display: JSON.stringify(val),
            raw: val
          };
        case 'object':
          if (typeof val !== 'object') {
            return {
              display: 'Invalid object',
              raw: null,
              error: 'Expected object but got ' + typeof val
            };
          }
          return {
            display: formatNestedObject(val),
            raw: val
          };
        case 'number':
          const num = Number(val);
          if (isNaN(num)) {
            return {
              display: 'Invalid number',
              raw: null,
              error: 'Invalid number value'
            };
          }
          return {
            display: num.toString(),
            raw: num
          };
        case 'string':
          return {
            display: String(val),
            raw: String(val)
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

  const formatNestedObject = (obj: any, prefix = ''): string => {
    if (!obj || typeof obj !== 'object') return String(obj);
    
    return Object.entries(obj)
      .map(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return formatNestedObject(value, fullKey);
        }
        return `${fullKey}: ${JSON.stringify(value)}`;
      })
      .join('\n');
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
    
    // Return compact display of key properties for collapsed view
    return Object.entries(nestedValues)
      .map(([key, val]) => {
        const displayVal = 
          val === null || val === undefined ? 'N/A' :
          typeof val === 'object' ? (Array.isArray(val) ? `[${val.length}]` : `{...}`) :
          String(val).substring(0, 15);
        
        return `${key}: ${displayVal}`;
      })
      .slice(0, 3)  // Only show first 3 properties
      .join(' | ');
  };

  const categoryColor: Record<string, string> = {
    browser: 'bg-blue-700/20 text-blue-400',
    network: 'bg-green-700/20 text-green-400',
    behavior: 'bg-purple-700/20 text-purple-400',
    hardware: 'bg-amber-700/20 text-amber-400',
    fingerprinting: 'bg-rose-700/20 text-rose-400'
  };

  const renderNestedValues = () => {
    if (!feature.outputs || !value.raw) return null;
    
    const renderNestedObject = (obj: any, outputs: Record<string, FeatureValue>, prefix = '') => {
      return Object.entries(obj).map(([key, val]) => {
        const output = outputs[key];
        if (!output) return null;
        
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const isNested = val && typeof val === 'object' && !Array.isArray(val) && output.outputs;
        
        if (isNested && output.outputs) {
          return (
            <div key={fullKey} className="space-y-1">
              <div className="text-xs font-medium text-gray-400 mb-1">{output.name}:</div>
              <div className="ml-4">
                {renderNestedObject(val, output.outputs, fullKey)}
              </div>
            </div>
          );
        }

        const formattedValue = formatValue(val, output.type);
        
        return (
          <div key={fullKey} className="flex justify-between items-center py-1 hover:bg-gray-800/50 rounded">
            <span className="font-mono text-xs text-gray-400">{output.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-200">
                {formattedValue.display}
              </span>
              {output.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">{output.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        );
      });
    };

    return (
      <div className="grid gap-1 mt-2">
        {renderNestedObject(value.raw, feature.outputs)}
      </div>
    );
  };

  const renderSimpleValue = () => {
    if (!value.raw) return null;
    
    return (
      <div className="font-mono text-xs flex items-center gap-2">
        <span className="text-gray-400">{feature.name}:</span>
        <span className="text-gray-200">
          {value.type === 'boolean' ? (value.raw ? 'Yes' : 'No') : value.display}
        </span>
      </div>
    );
  };

  return (
    <Card className="border-b border-gray-800 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-2 cursor-pointer space-y-0" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-[200px_auto_1fr] gap-4 items-center w-full">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate">
                  {hasError && <AlertTriangle size={14} className="inline text-yellow-500 mr-1" />}
                  {feature.name}
                  {feature.dependency && (
                    <Package size={14} className="inline text-blue-400 ml-1" />
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {getTypeIcon(feature.type)}
              </div>
              <div className="flex items-center justify-between w-full">
                {isLoading ? (
                  <span className="text-gray-400 text-xs">Loading...</span>
                ) : hasError ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded text-rose-400 cursor-help">
                          {value.display.length > 30 ? value.display.substring(0, 30) + '...' : value.display}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs text-rose-400">{value.error}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : feature.outputs ? (
                  <div className="font-mono text-xs bg-gray-800 px-2 py-1 rounded max-w-full overflow-hidden">
                    {value.display}
                  </div>
                ) : (
                  renderSimpleValue()
                )}
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
          <CardContent className="p-3 pt-0 space-y-2">
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
            
            {feature.outputs && value.raw && (
              <div className="bg-gray-800/50 p-2 rounded space-y-1">
                <h4 className="text-xs font-semibold text-gray-300 mb-1">Output Properties</h4>
                {Object.entries(feature.outputs).map(([key, output]) => (
                  <div key={key} className="bg-gray-800 p-1.5 rounded flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold">{key}</code>
                        <Badge variant="outline" className="text-xs">
                          {output.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{output.description}</p>
                    </div>
                    <div className="font-mono text-xs bg-gray-900 px-2 py-1 rounded max-w-[50%] overflow-hidden text-ellipsis">
                      {value.raw[key] !== undefined ? 
                        (typeof value.raw[key] === 'object' ? 
                          JSON.stringify(value.raw[key]).substring(0, 30) + "..." : 
                          String(value.raw[key])) : 
                        'undefined'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-gray-800 p-2 rounded flex items-start gap-2">
              <Code size={16} className="mt-1 text-gray-400" />
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
                {feature.code}
              </pre>
            </div>
            
            {hasError && (
              <div className="bg-rose-900/20 border border-rose-800 p-2 rounded text-xs text-rose-300">
                <strong>Error:</strong> {value.error}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
