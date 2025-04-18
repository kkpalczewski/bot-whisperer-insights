
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface FeatureCellProps {
  feature: string;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const FeatureCell: React.FC<FeatureCellProps> = ({
  feature,
  level,
  hasChildren,
  isExpanded,
  onToggle,
}) => {
  return (
    <div className="flex items-start">
      <div
        style={{ paddingLeft: `${level * 20}px` }}
        className="flex items-center"
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 mr-1"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
        <span className="text-sm font-mono text-gray-200 font-medium">{feature}</span>
      </div>
    </div>
  );
};
