
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

  useEffect(() => {
    evaluateCode();
  }, []);

  const evaluateCode = () => {
    try {
      const result = new Function(`return ${feature.code}`)();
      setValue(typeof result === 'object' ? JSON.stringify(result) : result);
    } catch (error) {
      setValue(`Error: ${(error as Error).message}`);
      toast.error(`Error evaluating ${feature.name}: ${(error as Error).message}`);
    }
  };

  // Category color mapping
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
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">{feature.name}</h3>
              <Badge className={`${categoryColor[feature.category]} text-xs`}>{feature.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </code>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
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
