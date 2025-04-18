import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileJson, FileCode, FileText, ChevronDown, ChevronRight, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MetadataDialog } from './MetadataDialog';

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
  isTruncated?: boolean;
}

const getTypeIcon = (value: string | boolean | undefined) => {
  if (typeof value === 'boolean') 
    return <FileCode className="h-4 w-4 text-blue-400" />;
  if (typeof value === 'string' && !isNaN(Number(value))) 
    return <FileText className="h-4 w-4 text-green-400" />;
  return <FileJson className="h-4 w-4 text-purple-400" />;
};

const truncateValue = (value: string | boolean | undefined): { displayValue: string, isTruncated: boolean } => {
  if (typeof value !== 'string') {
    return { displayValue: String(value), isTruncated: false };
  }
  
  const lines = value.split('\n');
  if (lines.length <= 3) {
    return { displayValue: value, isTruncated: false };
  }
  
  const truncated = lines.slice(0, 3).join('\n') + '\n...';
  return { displayValue: truncated, isTruncated: true };
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
  description,
  isTruncated = false
}) => {
  const { displayValue, isTruncated: isValueTruncated } = truncateValue(value);

  return (
    <TableRow 
      className={`${isExpanded ? 'bg-gray-800/20' : 'hover:bg-gray-800/50'} ${isTruncated ? 'text-gray-500 italic' : ''}`}
    >
      <TableCell className="p-1 w-[45%]">
        <div className="flex items-center">
          <div style={{ marginLeft: `${level * 16}px` }} className="flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0"
                onClick={onToggle}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-5" />}
            <span className="font-mono text-xs text-gray-300">
              {feature}
            </span>
            <MetadataDialog
              feature={feature}
              value={value}
              parent={parent}
              description={description}
              error={error}
              level={level}
              id={feature}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
            />
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle size={16} className="text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs text-red-400">{error}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="p-1 w-[5%]">
        {getTypeIcon(value)}
      </TableCell>
      <TableCell className="p-1 w-[35%] font-mono text-xs font-medium">
        <div className="max-w-full overflow-hidden">
          <span className={`${error ? 'text-gray-400' : 'text-white'} break-all`}>
            {displayValue === undefined ? 'undefined' : displayValue}
          </span>
          {isValueTruncated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0 ml-1">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="start" className="max-w-[600px] max-h-[400px] overflow-auto">
                  <p className="text-xs font-mono whitespace-pre-wrap break-all">{value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="p-1 w-[15%] text-xs text-gray-400">
        {parent}
      </TableCell>
    </TableRow>
  );
};
