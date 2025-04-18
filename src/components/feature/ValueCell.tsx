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
  
  const rawValue = value === undefined ? 'undefined' : String(value);
  let parsedValue = rawValue;

  try {
    // Attempt to parse the value based on expectedType
    if (expectedType === 'boolean') {
      parsedValue = String(value === 'true' || value === true);
    } else if (expectedType === 'number' && !isNaN(Number(value))) {
      parsedValue = String(Number(value));
    } else if (expectedType === 'object' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        parsedValue = JSON.stringify(parsed, null, 2);
      } catch {
        // If parsing fails, keep the raw value
        parsedValue = rawValue;
      }
    }
  } catch {
    // If any parsing fails, keep the raw value
    parsedValue = rawValue;
  }
  
  const lines = parsedValue.split('\n');
  const isLongValue = lines.length > 3 || parsedValue.length > 150;
  
  let displayValue = parsedValue;
  if (isLongValue && !isValueExpanded) {
    if (lines.length > 3) {
      displayValue = lines.slice(0, 3).join('\n') + '\n...';
    } else if (parsedValue.length > 150) {
      displayValue = parsedValue.slice(0, 150) + '...';
    }
  }

  return (
    <div className="relative">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all font-semibold max-h-24 overflow-y-auto">
                  <FormattedValue value={displayValue} expectedType={expectedType} />
                </pre>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-md">
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Raw value:</div>
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {rawValue}
                  </pre>
                  {rawValue !== parsedValue && (
                    <>
                      <div className="text-xs text-gray-400">Parsed value:</div>
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {parsedValue}
                      </pre>
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isLongValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 flex-shrink-0"
            onClick={() => setIsValueExpanded(!isValueExpanded)}
          >
            {isValueExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
      </div>
      {error && (
        <div className="mt-1">
          <span className="text-xs text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};
