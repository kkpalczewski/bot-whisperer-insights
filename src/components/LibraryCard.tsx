
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { LibraryInfo } from '@/config/detectionFeatures';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LibraryCardProps {
  library: LibraryInfo;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ library }) => {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{library.name}</CardTitle>
          <a 
            href={library.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            Website <ExternalLink size={14} />
          </a>
        </div>
        <CardDescription className="mt-1">{library.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {library.features.map((feature, index) => (
            <Badge key={index} variant="outline" className="bg-gray-100">
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
