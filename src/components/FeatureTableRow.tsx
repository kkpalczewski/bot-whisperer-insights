
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { MetadataDialog } from './MetadataDialog';
import { Button } from './ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FeatureTableRowProps {
  feature: string;
  value: string | boolean | undefined;
  parent: string;
  level: number;
  onToggle: () => void;
  isExpanded: boolean;
  hasChildren: boolean;
  description?: string;
  error?: string;
  isTruncated?: boolean;
}

export const FeatureTableRow: React.FC<FeatureTableRowProps> = ({
  feature,
  value,
  parent,
  level,
  onToggle,
  isExpanded,
  hasChildren,
  description,
  error,
  isTruncated
}) => {
  const [isValueExpanded, setIsValueExpanded] = useState(false);
  const id = `${parent}.${feature}`.replace(/\s/g, '_');
  
  // Convert the value to a string representation
  const stringValue = value === undefined 
    ? 'undefined' 
    : typeof value === 'boolean' 
      ? String(value) 
      : String(value);
  
  // Handle value truncation
  const lines = stringValue.split('\n');
  const isLongValue = lines.length > 3 || stringValue.length > 150;
  
  // Calculate truncated display value
  let displayValue = stringValue;
  if (isLongValue && !isValueExpanded) {
    if (lines.length > 3) {
      displayValue = lines.slice(0, 3).join('\n') + '\n...';
    } else if (stringValue.length > 150) {
      displayValue = stringValue.slice(0, 150) + '...';
    }
  }

  // Calculate indentation for hierarchical display
  const indent = level * 20;

  return (
    <TableRow className={error ? 'bg-red-950/20' : ''}>
      <TableCell className="py-2 align-top">
        <div className="flex items-start">
          <div
            style={{ paddingLeft: `${indent}px` }}
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
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <span className="text-sm font-mono truncate">{feature}</span>
          </div>
        </div>
      </TableCell>
      
      <TableCell className="py-2 pr-1 align-top">
        <MetadataDialog
          feature={feature}
          value={value}
          parent={parent}
          description={description}
          error={error}
          level={level}
          id={id}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
        />
      </TableCell>
      
      <TableCell className="py-2 align-top">
        <div className="relative">
          {isLongValue ? (
            <div className="flex items-start">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all text-gray-400 max-h-24 overflow-y-auto">
                      {displayValue}
                    </pre>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-md">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                      {stringValue}
                    </pre>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 ml-1 flex-shrink-0"
                onClick={() => setIsValueExpanded(!isValueExpanded)}
              >
                {isValueExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all text-gray-400">
                    {displayValue}
                  </pre>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {stringValue}
                  </pre>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {error && (
            <div className="mt-1">
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell className="py-2 align-top">
        <span className="text-xs font-mono text-gray-400 truncate">{parent}</span>
      </TableCell>
    </TableRow>
  );
};
