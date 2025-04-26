import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertTriangle, Info, Package } from "lucide-react";
import React from "react";

interface RootFeatureHeaderProps {
  name: string;
  dependency?: string;
  description?: string;
  hasError: boolean;
  onToggleCode: () => void;
  codeVisible: boolean;
}

export const RootFeatureHeader: React.FC<RootFeatureHeaderProps> = ({
  name,
  dependency,
  description,
  hasError,
  onToggleCode,
  codeVisible,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {hasError && <AlertTriangle size={16} className="text-yellow-500" />}
        <h3 className="text-sm font-medium">
          {name}
          {dependency && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="inline"
                    onClick={isMobile ? (e) => e.preventDefault() : undefined}
                  >
                    <Package
                      size={14}
                      className="inline text-blue-400 ml-1 cursor-help"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Dependencies: {dependency}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 whitespace-pre-line"
                  onClick={isMobile ? (e) => e.preventDefault() : undefined}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs whitespace-pre-line">
                  {description}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={onToggleCode}
        >
          {codeVisible ? "Hide code" : "Show code"}
        </Button>
      </div>
    </div>
  );
};
