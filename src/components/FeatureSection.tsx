import { FeaturePill } from "@/components/FeaturePill";
import { RootDetectionFeatureSchema, DetectionFeatureSchema } from "@/detection/types/detectionSchema";
import { detectionFeaturesMapSchema } from "@/detection/config/detectionSchemaLoader";
import { DetectionResult } from "@/detection/core/types";
import { ErrorBoundary } from "./ErrorBoundary";

interface FeatureSectionProps {
  detectionFeaturesMapSchema: typeof detectionFeaturesMapSchema;
  results: DetectionResult;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  detectionFeaturesMapSchema,
  results,
}) => {
  return (
    <ErrorBoundary
      fallback={<div className="text-red-500">Error loading features</div>}
    >
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Bot Detection Features
          </h2>
        </div>
        <div className="space-y-0">
          {Object.values(detectionFeaturesMapSchema).map((rootFeature) => (
            <FeaturePill
              key={rootFeature.fullKey}
              rootFeature={rootFeature}
              result={results[rootFeature.fullKey]}
            />
          ))}
        </div>
      </section>
    </ErrorBoundary>
  );
};
