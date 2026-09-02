import { FeaturePill } from "@/components/FeaturePill";
import { detectionFeaturesMapSchema } from "@/detection/config/detectionSchemaLoader";
import { ErrorBoundary } from "./ErrorBoundary";

export const FeatureSection: React.FC = () => {
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
          {detectionFeaturesMapSchema.map((rootFeature) => (
            <FeaturePill key={rootFeature.fullKey} rootFeature={rootFeature} />
          ))}
        </div>
      </section>
    </ErrorBoundary>
  );
};
