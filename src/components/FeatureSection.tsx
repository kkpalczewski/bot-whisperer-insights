import { FeaturePill } from "@/components/FeaturePill";
import { DetectionFeature } from "@/detection/config/detectionFeatures";
import { DetectionResult } from "@/detection/core/types";
import { ErrorBoundary } from "./ErrorBoundary";

interface FeatureSectionProps {
  features: DetectionFeature[];
  results: DetectionResult;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  features,
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
          {features.map((feature) => (
            <FeaturePill
              key={feature.id}
              feature={feature}
              result={results[feature.codeName]}
            />
          ))}
        </div>
      </section>
    </ErrorBoundary>
  );
};
