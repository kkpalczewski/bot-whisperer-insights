
import React, { useState } from 'react';
import { DetectionFeature } from '@/config/detectionFeatures';
import { Clipboard, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FeaturePillProps {
  feature: DetectionFeature;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [value, setValue] = useState<any>('Click to evaluate');
  const [copied, setCopied] = useState(false);

  const evaluateCode = () => {
    try {
      // Use Function constructor to evaluate the code string safely
      const result = new Function(`return ${feature.code}`)();
      setValue(typeof result === 'object' ? JSON.stringify(result) : result);
    } catch (error) {
      setValue(`Error: ${(error as Error).message}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(feature.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Category color mapping
  const categoryColor = {
    browser: 'bg-blue-100 text-blue-800',
    network: 'bg-green-100 text-green-800',
    behavior: 'bg-purple-100 text-purple-800',
    hardware: 'bg-amber-100 text-amber-800',
    fingerprinting: 'bg-rose-100 text-rose-800'
  }[feature.category];

  return (
    <Card className="w-full mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{feature.name}</CardTitle>
          <Badge className={categoryColor}>{feature.category}</Badge>
        </div>
        <CardDescription className="mt-1">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="bg-gray-100 p-3 rounded-md flex items-start gap-2 relative">
          <Code size={18} className="mt-1 text-gray-500" />
          <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap flex-1">
            {feature.code}
          </pre>
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute top-2 right-2" 
            onClick={copyCode}
          >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-2 bg-gray-50">
        <div className="flex justify-between items-center w-full">
          <span className="text-sm font-medium">Value:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm truncate max-w-[300px]">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2" 
              onClick={evaluateCode}
            >
              Evaluate
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
