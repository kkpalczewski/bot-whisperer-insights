import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DetectionFeatureSchema, RootDetectionFeatureSchema } from "@/detection/types/detectionSchema";
import { DetectionResult } from "@/detection/core/types";
import { useFeatureTree } from "@/hooks/useFeatureTree";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { CodePreview } from "./CodePreview";
import { RootFeatureHeader } from "./RootFeatureHeader";
import { FeatureTable } from "./FeatureTable";
import { detectionFeaturesFlatSchema } from "@/detection/config/detectionSchemaLoader";

interface FeaturePillProps {
  rootFeature: RootDetectionFeatureSchema;
  result?: DetectionResult[string];
}


export const FeaturePill: React.FC<FeaturePillProps> = ({
  rootFeature,
  result,
}) => {
  const [codeVisible, setCodeVisible] = useState(false);
  const { isLoading, hasError, flattenedNodes, toggleNode, loadResults, featureTree } =
    useFeatureTree(rootFeature as RootDetectionFeatureSchema);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResults();
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
