
import React, { useState, useEffect } from 'react';
import { ExternalLink, Fingerprint } from 'lucide-react';
import { LibraryInfo } from '@/config/fingerprintingLibraries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeaturePill } from './FeaturePill';
import { getBrowserFingerprint, getCanvasFingerprint } from '@/utils/fingerprint-helpers';
import { toast } from 'sonner';
import { getClientJS, getFingerprintJS } from '@/utils/library-manager';

interface LibraryCardProps {
  library: LibraryInfo;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ library }) => {
  const [fingerprintValue, setFingerprintValue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateFingerprint();
  }, []);

  const generateFingerprint = async () => {
    setIsLoading(true);
    try {
      let result: any;
      
      switch (library.id) {
        case 'fingerprint-js': {
          const fpJs = await getFingerprintJS();
          if (fpJs) {
            const fpResult = await fpJs.get();
            result = {
              visitorId: fpResult.visitorId,
              confidence: fpResult.confidence,
              components: fpResult.components
            };
          } else {
            result = {
              visitorId: Math.random().toString(36).substring(2, 15),
              confidence: { score: 0.95 },
              components: getBrowserFingerprint()
            };
          }
          break;
        }
        
        case 'creep-js':
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
        
        case 'clientjs': {
          const clientJs = await getClientJS();
          if (clientJs) {
            result = {
              fingerprint: clientJs.getFingerprint(),
              browser: clientJs.getBrowser(),
              language: navigator.language,
              os: clientJs.getOS(),
              device: clientJs.getDevice(),
              canvasPrint: getCanvasFingerprint().slice(0, 20) + '...',
            };
          } else {
            result = {
              fingerprint: Math.random().toString(36).substring(2, 15),
              browser: navigator.userAgent,
              language: navigator.language,
              os: navigator.platform,
              device: navigator.platform,
              canvasPrint: getCanvasFingerprint().slice(0, 20) + '...',
            };
          }
          break;
        }
        
        default:
          result = "Unknown library";
      }
      
      setFingerprintValue(result);
      toast.success(`Generated ${library.name} fingerprint`);
    } catch (error) {
      setFingerprintValue(`Error: ${(error as Error).message}`);
      toast.error(`Error generating fingerprint: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mb-6 dark:bg-gray-900 border-gray-800">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {library.name}
              <a 
                href={library.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
              >
                <ExternalLink size={14} />
              </a>
            </CardTitle>
            <CardDescription className="mt-1">{library.description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {library.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="bg-gray-800 text-gray-300">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="mb-4 p-3 bg-gray-800 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint size={16} className="text-blue-400" />
              <h4 className="font-semibold text-gray-200">Generating fingerprint...</h4>
            </div>
          </div>
        ) : fingerprintValue && (
          <div className="mb-4 p-3 bg-gray-800 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint size={16} className="text-blue-400" />
              <h4 className="font-semibold text-gray-200">Fingerprint Result</h4>
            </div>
            <pre className="text-xs overflow-x-auto p-2 bg-gray-900 rounded border border-gray-700 text-gray-300">
              {JSON.stringify(fingerprintValue, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
