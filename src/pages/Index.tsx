
import { useState } from 'react';
import { FeaturePill } from '@/components/FeaturePill';
import { LibraryCard } from '@/components/LibraryCard';
import { Header } from '@/components/Header';
import { FingerprintData } from '@/components/FingerprintData';
import { detectionFeatures, fingerprintingLibraries } from '@/config/detectionFeatures';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  'all',
  ...Array.from(new Set(detectionFeatures.map(f => f.category)))
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFeatures = selectedCategory === 'all' 
    ? detectionFeatures 
    : detectionFeatures.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Bot Detection Features</h2>
              <div className="flex items-center">
                <Filter size={16} className="mr-2 text-gray-500" />
                <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
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
            
            <div className="grid grid-cols-1 gap-4">
              {filteredFeatures.map((feature) => (
                <FeaturePill key={feature.id} feature={feature} />
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Fingerprinting Libraries</h2>
            <div className="grid grid-cols-1 gap-4">
              {fingerprintingLibraries.map((library) => (
                <LibraryCard key={library.id} library={library} />
              ))}
            </div>
          </section>

          <FingerprintData />
        </div>
      </main>
    </div>
  );
};

export default Index;
