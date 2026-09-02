import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LibraryInfo } from "@/detection/config/fingerprintingLibraries";
import { getClientJS } from "@/detection/utils/external-libraries/clientjs-manager";
import { getFingerprintJS } from "@/detection/utils/external-libraries/fingerprintjs-manager";
import { ExternalLink, Fingerprint } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface LibraryCardProps {
  library: LibraryInfo;
}

type FingerprintValue = Record<string, unknown> | { error: string };

const generateFingerprint = async (libraryId: string): Promise<FingerprintValue> => {
  switch (libraryId) {
    case "fingerprintjs": {
      const agent = await getFingerprintJS();
      const result = await agent.get();
      return {
        visitorId: result.visitorId,
        confidence: result.confidence,
        components: result.components,
      };
    }
    case "clientjs": {
      const client = await getClientJS();
      return {
        fingerprint: client.getFingerprint(),
        browser: client.getBrowser(),
        language: navigator.language,
        os: client.getOS(),
        device: client.getDevice(),
      };
    }
    default:
      return { error: "Unknown library" };
  }
};

export const LibraryCard: React.FC<LibraryCardProps> = ({ library }) => {
  const [fingerprintValue, setFingerprintValue] = useState<FingerprintValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    generateFingerprint(library.id)
      .catch((error: unknown) => ({
        error: error instanceof Error ? error.message : String(error),
      }))
      .then((result) => {
        if (cancelled) return;
        setFingerprintValue(result);
        setIsLoading(false);
        if ("error" in result && result.error) {
          toast.error(`${library.name}: ${result.error}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [library.id, library.name]);

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
                aria-label={`${library.name} website`}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
              >
                <ExternalLink size={14} />
              </a>
            </CardTitle>
            <CardDescription className="mt-1">
              {library.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {library.features.map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className="bg-gray-800 text-gray-300"
              >
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
              <h4 className="font-semibold text-gray-200">
                Generating fingerprint...
              </h4>
            </div>
          </div>
        ) : (
          fingerprintValue && (
            <div className="mb-4 p-3 bg-gray-800 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint size={16} className="text-blue-400" />
                <h4 className="font-semibold text-gray-200">
                  Fingerprint Result
                </h4>
              </div>
              <pre className="text-xs overflow-x-auto p-2 bg-gray-900 rounded border border-gray-700 text-gray-300">
                {JSON.stringify(fingerprintValue, null, 2)}
              </pre>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
