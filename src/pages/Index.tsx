import { FeaturePill } from "@/components/FeaturePill";
import { FingerprintData } from "@/components/FingerprintData";
import { Header } from "@/components/Header";
import { LibraryCard } from "@/components/LibraryCard";
import { features } from "@/config/detectionFeatures";
import { libraries } from "@/config/fingerprintingLibraries";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                Bot Detection Features
              </h2>
            </div>

            <div className="space-y-0">
              {features.map((feature) => (
                <FeaturePill key={feature.id} feature={feature} />
              ))}
            </div>
          </section>

          {libraries && libraries.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6">
                Fingerprinting Libraries
              </h2>
              <div className="space-y-0">
                {libraries.map((library) => (
                  <LibraryCard key={library.id} library={library} />
                ))}
              </div>
            </section>
          )}

          <FingerprintData />
        </div>
      </main>
    </div>
  );
};

export default Index;
