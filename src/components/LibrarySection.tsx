import { LibraryCard } from "@/components/LibraryCard";
import { FingerprintingLibrary } from "@/detection/config/fingerprintingLibraries";
import { ErrorBoundary } from "./ErrorBoundary";

interface LibrarySectionProps {
  libraries: FingerprintingLibrary[];
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  libraries,
}) => {
  if (!libraries || libraries.length === 0) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={<div className="text-red-500">Error loading libraries</div>}
    >
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
    </ErrorBoundary>
  );
};
