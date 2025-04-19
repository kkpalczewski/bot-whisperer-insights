import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DetectionFeature } from "@/config/detectionFeatures";
import { useFeatureTree } from "@/hooks/useFeatureTree";
import React, { useEffect, useRef, useState } from "react";
import { CodePreview } from "./CodePreview";
import { FeatureHeader } from "./FeatureHeader";
import { FeatureTable } from "./FeatureTable";

interface FeaturePillProps {
  feature: DetectionFeature;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [codeVisible, setCodeVisible] = useState(false);
  const { isLoading, hasError, flattenedNodes, toggleNode, evaluateCode } =
    useFeatureTree(feature);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    evaluateCode();
  }, []);

  useEffect(() => {
    if (codeVisible && codeRef.current) {
      // Small delay to ensure the code section is rendered
      setTimeout(() => {
        codeRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [codeVisible]);

  return (
    <Card className="border-b border-gray-800 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <CardHeader className="p-2 space-y-0">
        <FeatureHeader
          name={feature.name}
          dependency={feature.dependency}
          description={feature.description}
          hasError={hasError}
          onToggleCode={() => setCodeVisible(!codeVisible)}
          codeVisible={codeVisible}
        />
      </CardHeader>

      <CardContent className="px-2 pb-2 pt-0 space-y-2">
        <FeatureTable
          nodes={flattenedNodes}
          isLoading={isLoading}
          onToggleNode={toggleNode}
        />

        {codeVisible && (
          <div ref={codeRef}>
            <CodePreview code={feature.code} hasError={hasError} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
