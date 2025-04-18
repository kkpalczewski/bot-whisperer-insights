
import React, { useState, useEffect } from 'react';
import { DetectionFeature } from '@/config/detectionFeatures';
import { ChevronDown, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface FeaturePillProps {
  feature: DetectionFeature;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [value, setValue] = useState<any>('Evaluating...');
  const [isOpen, setIsOpen] = useState(false);

  // Format value for display and database storage
  const formatValue = (val: any): { display: string; raw: any } => {
    if (typeof val === 'object') {
      return {
        display: JSON.stringify(val),
        raw: val
      };
    }
    return {
      display: String(val),
      raw: val
    };
  };

  useEffect(() => {
    evaluateCode();
  }, []);

  const evaluateCode = () => {
    try {
      const result = new Function(`return ${feature.code}`)();
      const formattedResult = formatValue(result);
      setValue(formattedResult);
    } catch (error) {
      const errorValue = {
        display: `Error: ${(error as Error).message}`,
        raw: { error: (error as Error).message }
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
            <div className="grid grid-cols-[250px_120px_1fr] gap-4 items-center w-full">
              <h3 className="text-sm font-medium truncate">{feature.name}</h3>
              <Badge className={`${categoryColor[feature.category]} text-xs w-fit`}>
                {feature.category}
              </Badge>
              <div className="flex items-center justify-between w-full">
                <code className="text-xs bg-gray-800 px-2 py-1 rounded max-w-[300px] truncate">
                  {value?.display || String(value)}
                </code>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-2">
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
