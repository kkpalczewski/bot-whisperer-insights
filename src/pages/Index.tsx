import { useState } from 'react';
import { FeaturePill } from '@/components/FeaturePill';
import { LibraryCard } from '@/components/LibraryCard';
import { Header } from '@/components/Header';
import { FingerprintData } from '@/components/FingerprintData';
import { features } from '@/config/detectionFeatures';
import { libraries } from '@/config/fingerprintingLibraries';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const categories = [
  'all',
  ...Array.from(new Set(features.map(f => f.category)))
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Bot Detection Features</h2>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <div className="flex gap-1">
                  {categories.map(category => (
                    <Badge 
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-0">
              {filteredFeatures.map((feature) => (
                <FeaturePill key={feature.id} feature={feature} />
              ))}
            </div>
          </section>

          {libraries && libraries.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6">Fingerprinting Libraries</h2>
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
