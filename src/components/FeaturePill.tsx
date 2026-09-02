import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RootDetectionFeatureSchema } from "@/detection/types/detectionSchema";
import { useFeatureTree } from "@/hooks/useFeatureTree";
import React, { useEffect, useRef, useState } from "react";
import { CodePreview } from "./CodePreview";
import { RootFeatureHeader } from "./RootFeatureHeader";
import { FeatureTable } from "./FeatureTable";

interface FeaturePillProps {
  rootFeature: RootDetectionFeatureSchema;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ rootFeature }) => {
  const [codeVisible, setCodeVisible] = useState(false);
  const { isLoading, hasError, toggleNode, featureTree } =
    useFeatureTree(rootFeature);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!codeVisible || !codeRef.current) return;
    // Small delay to ensure the code section is rendered
    const timer = setTimeout(() => {
      codeRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [codeVisible]);

  return (
    <Card className="border-b border-gray-800 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <CardHeader className="p-2 space-y-0">
        <RootFeatureHeader
          name={rootFeature.name}
          dependency={rootFeature.dependency}
          description={rootFeature.description}
          hasError={hasError}
          onToggleCode={() => setCodeVisible(!codeVisible)}
          codeVisible={codeVisible}
        />
      </CardHeader>

      <CardContent className="px-2 pb-2 pt-0 space-y-2">
        <FeatureTable
          nodes={featureTree}
          isLoading={isLoading}
          onToggleNode={toggleNode}
        />

        {codeVisible && (
          <div ref={codeRef}>
            <CodePreview code={rootFeature.code} hasError={hasError} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
