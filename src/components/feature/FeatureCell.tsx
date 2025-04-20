import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";

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
  const isMobile = useIsMobile();
  const indentSize = isMobile ? 12 : 20;

  return (
    <div className="flex items-start">
      <div
        style={{ paddingLeft: `${level * indentSize}px` }}
        className="flex items-center w-full"
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 mr-1 flex-shrink-0"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-mono text-gray-200 font-medium truncate block">
                {feature}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <p className="text-sm font-mono">{feature}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
