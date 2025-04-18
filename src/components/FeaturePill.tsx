
import React, { useState } from 'react';
import { DetectionFeature } from '@/config/detectionFeatures';
import { ChevronDown, Clipboard, Check, Code, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface FeaturePillProps {
  feature: DetectionFeature;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [value, setValue] = useState<any>('Click to evaluate');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const evaluateCode = () => {
    try {
      // Use Function constructor to evaluate the code string safely
      const result = new Function(`return ${feature.code}`)();
      setValue(typeof result === 'object' ? JSON.stringify(result) : result);
      toast.success("Evaluation complete!");
    } catch (error) {
      setValue(`Error: ${(error as Error).message}`);
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(feature.code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Category color mapping
  const categoryColor: Record<string, string> = {
    browser: 'bg-blue-700/20 text-blue-400',
    network: 'bg-green-700/20 text-green-400',
    behavior: 'bg-purple-700/20 text-purple-400',
    hardware: 'bg-amber-700/20 text-amber-400',
    fingerprinting: 'bg-rose-700/20 text-rose-400'
  };

  const getIconByCategory = () => {
    const icons: Record<string, React.ReactNode> = {
      browser: <Code size={16} />,
      network: <TrendingUp size={16} />,
      fingerprinting: <Clipboard size={16} />
    };
    return icons[feature.category] || <Code size={16} />;
  };

  return (
    <Card className="w-full mb-4 overflow-hidden dark:bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-all">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{feature.name}</CardTitle>
              <Badge className={`${categoryColor[feature.category]} ml-2`}>{feature.category}</Badge>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm font-medium text-white/70">Value:</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm truncate max-w-[300px] text-white/90">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2 h-7 bg-gray-800" 
                onClick={(e) => {
                  e.stopPropagation();
                  evaluateCode();
                }}
              >
                Evaluate
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pb-2 pt-0">
            <p className="text-sm text-gray-300 mb-3">{feature.description}</p>
            <div className="bg-gray-800 p-3 rounded-md flex items-start gap-2 relative">
              <Code size={18} className="mt-1 text-gray-400" />
              <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
                {feature.code}
              </pre>
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-2 right-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode();
                }}
              >
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
