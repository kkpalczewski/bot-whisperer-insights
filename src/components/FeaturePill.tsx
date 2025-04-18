
import React, { useState, useEffect } from 'react';
import { DetectionFeature } from '@/config/detectionFeatures';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useFeatureTree } from '@/hooks/useFeatureTree';
import { FeatureHeader } from './FeatureHeader';
import { FeatureTable } from './FeatureTable';
import { CodePreview } from './CodePreview';

interface FeaturePillProps {
  feature: DetectionFeature;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ feature }) => {
  const [codeVisible, setCodeVisible] = useState(false);
  const { isLoading, hasError, flattenedNodes, toggleNode, evaluateCode } = useFeatureTree(feature);

  useEffect(() => {
    evaluateCode();
  }, []);

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
          <CodePreview code={feature.code} hasError={hasError} />
        )}
      </CardContent>
    </Card>
  );
};
