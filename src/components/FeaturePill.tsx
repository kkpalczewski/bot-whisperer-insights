import React, { useState, useEffect } from 'react';
import { DetectionFeature } from '@/config/detectionFeatures';
import { ChevronDown, Code, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface FeaturePillProps {
  feature: DetectionFeature;
}

// Define a proper type for the return value of formatValue
interface FormattedValue {
  display: string;
  raw: any;
  error?: string; // Make error optional
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [value, setValue] = useState<FormattedValue>({ display: 'Evaluating...', raw: null });
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Format value based on type and for display
  const formatValue = (val: any, type: string): FormattedValue => {
    try {
      if (val === null || val === undefined) {
        return { display: 'Not available', raw: null };
      }

      switch (type) {
        case 'array':
          return {
            display: JSON.stringify(val, null, 2),
            raw: Array.isArray(val) ? val : [val]
          };
        case 'object':
          return {
            display: JSON.stringify(val, null, 2),
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

  const evaluateCode = () => {
    try {
      const result = new Function(`return ${feature.code}`)();
      const formattedResult = formatValue(result, feature.type);
      setValue(formattedResult);
      setHasError(false);
    } catch (error) {
      setHasError(true);
      const errorValue: FormattedValue = {
        display: `Error: ${(error as Error).message}`,
        raw: null,
        error: (error as Error).message
      };
      setValue(errorValue);
      toast.error(`Error evaluating ${feature.name}: ${(error as Error).message}`);
    }
  };

  const categoryColor: Record<string, string> = {
    browser: 'bg-blue-700/20 text-blue-400',
    network: 'bg-green-700/20 text-green-400',
    behavior: 'bg-purple-700/20 text-purple-400',
    hardware: 'bg-amber-700/20 text-amber-400',
    fingerprinting: 'bg-rose-700/20 text-rose-400'
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
                </h3>
              </div>
              <Badge className={`${categoryColor[feature.category]} text-xs w-fit`}>
                {feature.category}
              </Badge>
              <div className="flex items-center justify-between w-full">
                <div className="font-mono text-xs bg-gray-800 px-2 py-1 rounded max-h-24 overflow-y-auto break-all">
                  <pre className="whitespace-pre-wrap">{value?.display || String(value)}</pre>
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
            </div>
            <p className="text-sm text-gray-400">{feature.description}</p>
            <div className="bg-gray-800 p-3 rounded flex items-start gap-2">
              <Code size={16} className="mt-1 text-gray-400" />
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
                {feature.code}
              </pre>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
