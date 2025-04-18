
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ParentCellProps {
  parent: string;
}

export const ParentCell: React.FC<ParentCellProps> = ({ parent }) => {
  if (!parent) {
    return <span className="text-xs font-mono text-gray-400">—</span>;
  }
  
  // For long parent paths, show truncated version with tooltip
  const displayParent = parent.length > 20 ? parent.substring(0, 17) + '...' : parent;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs font-mono text-gray-400 truncate cursor-help">
            {displayParent}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-mono">{parent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
