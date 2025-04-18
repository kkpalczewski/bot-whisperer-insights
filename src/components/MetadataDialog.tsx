
import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetadataDialogProps {
  feature: string;
  value: string | boolean | undefined;
  parent: string;
  description?: string;
}

export const MetadataDialog: React.FC<MetadataDialogProps> = ({
  feature,
  value,
  parent,
  description
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
          <Info className="h-4 w-4 text-gray-400" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-mono mb-2">{feature}</h3>
          </div>
          {description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium mb-1">Value</h4>
            <p className="text-sm font-mono text-gray-400">
              {value === undefined ? 'undefined' : String(value)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Parent</h4>
            <p className="text-sm font-mono text-gray-400">{parent}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
