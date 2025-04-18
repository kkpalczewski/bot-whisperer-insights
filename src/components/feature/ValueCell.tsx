
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FormattedValue } from './FormattedValue';

interface ValueCellProps {
  value: string | boolean | undefined;
  error?: string;
  expectedType?: string;
}

export const ValueCell: React.FC<ValueCellProps> = ({ value, error, expectedType }) => {
  const [isValueExpanded, setIsValueExpanded] = useState(false);
  
  const stringValue = value === undefined 
    ? 'undefined' 
    : typeof value === 'boolean' 
      ? String(value) 
      : String(value);
  
  const lines = stringValue.split('\n');
  const isLongValue = lines.length > 3 || stringValue.length > 150;
  
  let displayValue = stringValue;
  if (isLongValue && !isValueExpanded) {
    if (lines.length > 3) {
      displayValue = lines.slice(0, 3).join('\n') + '\n...';
    } else if (stringValue.length > 150) {
      displayValue = stringValue.slice(0, 150) + '...';
    }
  }

  return (
    <div className="relative">
      {isLongValue ? (
        <div className="flex items-start">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all font-semibold max-h-24 overflow-y-auto">
                  <FormattedValue value={displayValue} expectedType={expectedType} />
                </pre>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-md">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                  <FormattedValue value={stringValue} expectedType={expectedType} />
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
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <pre className="text-xs font-mono whitespace-pre-wrap break-all font-semibold">
                <FormattedValue value={displayValue} expectedType={expectedType} />
              </pre>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                <FormattedValue value={stringValue} expectedType={expectedType} />
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
  );
};
