
import React, { useState } from 'react';
import { ExternalLink, Fingerprint, ChevronDown } from 'lucide-react';
import { LibraryInfo } from '@/config/detectionFeatures';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { getCanvasFingerprint, getBrowserFingerprint } from '@/utils/fingerprint-helpers';

interface LibraryCardProps {
  library: LibraryInfo;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ library }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fingerprintValue, setFingerprintValue] = useState<any>(null);

  const generateFingerprint = () => {
    try {
      let result: any;
      
      switch (library.id) {
        case 'fingerprint-js':
          // Simple simulation of FingerprintJS output
          result = {
            visitorId: Math.random().toString(36).substring(2, 15),
            confidence: { score: 0.95 },
            components: getBrowserFingerprint()
          };
          break;
        
        case 'creep-js':
          // Simple simulation of CreepJS output
          result = {
            fingerprint: Math.random().toString(36).substring(2, 10),
            lies: {
              detected: false,
              score: Math.random()
            },
            bot: Math.random() > 0.9,
            components: {
              ...getBrowserFingerprint(),
              canvas: getCanvasFingerprint()
            }
          };
          break;
        
        case 'clientjs':
          // Simple simulation of ClientJS output
          result = {
            fingerprint: Math.random().toString(36).substring(2, 15),
            browser: navigator.userAgent,
            language: navigator.language,
            os: navigator.platform,
            device: navigator.platform,
            canvasPrint: getCanvasFingerprint().slice(0, 20) + '...',
          };
          break;
        
        default:
          result = "Unknown library";
      }
      
      setFingerprintValue(result);
      toast.success(`Generated ${library.name} fingerprint`);
    } catch (error) {
      setFingerprintValue(`Error: ${(error as Error).message}`);
      toast.error(`Error generating fingerprint: ${(error as Error).message}`);
    }
  };

  return (
    <Card className="w-full mb-4 dark:bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-all">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{library.name}</CardTitle>
              <a 
                href={library.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm ml-2"
                onClick={(e) => e.stopPropagation()}
              >
                Website <ExternalLink size={14} />
              </a>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="mt-1 text-gray-400">{library.description}</CardDescription>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {library.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="bg-gray-800 text-gray-300">
                  {feature}
                </Badge>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  generateFingerprint();
                }} 
                className="flex items-center gap-2"
                variant="outline"
              >
                <Fingerprint size={16} />
                Generate Fingerprint
              </Button>
            </div>
            
            {fingerprintValue && (
              <div className="mt-4 p-3 bg-gray-800 rounded-md">
                <h4 className="font-semibold mb-2 text-gray-200">{library.name} Fingerprint Result:</h4>
                <pre className="text-xs overflow-x-auto p-2 bg-gray-900 rounded border border-gray-700 text-gray-300">
                  {typeof fingerprintValue === 'object' 
                    ? JSON.stringify(fingerprintValue, null, 2) 
                    : fingerprintValue}
                </pre>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
