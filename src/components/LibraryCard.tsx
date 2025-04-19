import React, { useState, useEffect } from 'react';
import { ExternalLink, Fingerprint } from 'lucide-react';
import { LibraryInfo } from '@/config/fingerprintingLibraries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getClientJS, getFingerprintJS, getCreepJS } from '@/utils/library-manager';

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
        case 'fingerprint-js':
        case 'fingerprintjs': {
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
              error: 'FingerprintJS library not available'
            };
          }
          break;
        }
        
        case 'creep-js':
        case 'creepjs': {
          const creepJs = await getCreepJS();
          if (creepJs) {
            try {
              const creepResult = await creepJs.get();
              result = {
                fingerprint: creepResult.fingerprint,
                lies: creepResult.lies,
                bot: creepResult.bot,
                components: creepResult.components
              };
            } catch (e) {
              console.error("Error with CreepJS:", e);
              result = {
                error: (e as Error).message
              };
            }
          } else {
            result = {
              error: "CreepJS library not available"
            };
          }
          break;
        }
        
        case 'clientjs': {
          const clientJs = await getClientJS();
          if (clientJs) {
            result = {
              fingerprint: clientJs.getFingerprint(),
              browser: clientJs.getBrowser(),
              language: navigator.language,
              os: clientJs.getOS(),
              device: clientJs.getDevice()
            };
          } else {
            result = {
              error: "ClientJS library not available"
            };
          }
          break;
        }
        
        default:
          result = {
            error: "Unknown library"
          };
      }
      
      setFingerprintValue(result);
      if (!result.error) {
        toast.success(`Generated ${library.name} fingerprint`);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error generating fingerprint:", error);
      setFingerprintValue({
        error: (error as Error).message
      });
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
