
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/button';
import { FileJson, FileCode, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface FeatureTableRowProps {
  feature: string;
  value: string | boolean | undefined;
  parent: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  level?: number;
  error?: string;
  description?: string;
}

const getTypeIcon = (value: string | boolean | undefined) => {
  if (typeof value === 'boolean') 
    return <FileCode className="h-4 w-4 text-blue-400" />;
  if (typeof value === 'string' && !isNaN(Number(value))) 
    return <FileText className="h-4 w-4 text-green-400" />;
  return <FileJson className="h-4 w-4 text-purple-400" />;
};

export const FeatureTableRow: React.FC<FeatureTableRowProps> = ({
  feature,
  value,
  parent,
  isExpanded = false,
  hasChildren = false,
  onToggle,
  level = 0,
  error,
  description
}) => {
  return (
    <TableRow 
      className={`${isExpanded ? 'bg-gray-800/20' : 'hover:bg-gray-800/50'}`}
    >
      <TableCell className="p-1 pl-4 w-1/2">
        <div className="flex items-center">
          <div style={{ marginLeft: `${level * 16}px` }} className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 mr-1"
              onClick={onToggle}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <HoverCard>
              <HoverCardTrigger>
                <span className="font-mono text-xs text-gray-300 cursor-help">
                  {feature}
                </span>
              </HoverCardTrigger>
              {description && (
                <HoverCardContent className="w-80">
                  <p className="text-sm">{description}</p>
                </HoverCardContent>
              )}
            </HoverCard>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-1 w-8">
        {getTypeIcon(value)}
      </TableCell>
      <TableCell className="p-1 w-1/3 font-mono text-xs font-medium">
        {error ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-400">undefined</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs text-red-400">{error}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-white">
            {value === undefined ? 'undefined' : (typeof value === 'boolean' ? value.toString() : value)}
          </span>
        )}
      </TableCell>
      <TableCell className="p-1 w-1/6 text-xs text-gray-400">
        {parent}
      </TableCell>
    </TableRow>
  );
};
