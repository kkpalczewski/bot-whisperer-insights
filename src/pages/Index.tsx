import { FeatureSection } from "@/components/FeatureSection";
import { Header } from "@/components/Header";
import { LibrarySection } from "@/components/LibrarySection";
import { useDetectionConfig } from "@/contexts/DetectionConfigContext";
import { detectionModule } from "@/detection";

const Index = () => {
  const { status, error } = useDetectionConfig();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {status === "error" ? (
            <div className="text-red-500">Error: {error?.message}</div>
          ) : (
            <>
              <FeatureSection />
              <LibrarySection libraries={detectionModule.getLibraries()} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
