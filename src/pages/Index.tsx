import { FeatureSection } from "@/components/FeatureSection";
import { FingerprintData } from "@/components/FingerprintData";
import { Header } from "@/components/Header";
import { LibrarySection } from "@/components/LibrarySection";
import { useDetectionConfig } from "@/contexts/DetectionConfigContext";
import { detectionModule } from "@/detection";
import { useMemo } from "react";

const Index = () => {
  const { results, status, error } = useDetectionConfig();

  const features = useMemo(() => detectionModule.getFeatures(), []);
  const libraries = useMemo(() => detectionModule.getLibraries(), []);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-red-500">Error: {error?.message}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <FeatureSection features={features} results={results} />
          <LibrarySection libraries={libraries} />
          <FingerprintData />
        </div>
      </main>
    </div>
  );
};

export default Index;
