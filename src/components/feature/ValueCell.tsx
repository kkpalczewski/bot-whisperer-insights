
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FormattedValue } from './FormattedValue';

interface ValueCellProps {
  value: string | boolean | undefined;
  type?: string;
  error?: string;
  parseValue?: boolean;
}

export const ValueCell: React.FC<ValueCellProps> = ({ value, type, error, parseValue }) => {
  const [isValueExpanded, setIsValueExpanded] = useState(false);
  
  const parseTypedValue = (val: string | boolean | undefined, type?: string) => {
    if (val === undefined) return undefined;
    if (typeof val === 'boolean') return val;
    
    try {
      switch (type) {
        case 'number':
          return parseFloat(String(val));
        case 'boolean':
          return val === 'true';
        case 'array':
          return Array.isArray(val) ? val : String(val).split(',');
        case 'object':
          return typeof val === 'string' ? JSON.parse(val) : val;
        default:
          return String(val);
      }
    } catch (e) {
      return String(val);
    }
  };
  
  const displayValue = parseValue ? parseTypedValue(value, type) : value;
  const stringValue = displayValue === undefined 
    ? 'undefined' 
    : typeof displayValue === 'boolean' 
      ? String(displayValue) 
      : String(displayValue);
  
  const lines = stringValue.split('\n');
  const isLongValue = lines.length > 3 || stringValue.length > 150;
  
  let truncatedValue = stringValue;
  if (isLongValue && !isValueExpanded) {
    if (lines.length > 3) {
      truncatedValue = lines.slice(0, 3).join('\n') + '\n...';
    } else if (stringValue.length > 150) {
      truncatedValue = stringValue.slice(0, 150) + '...';
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
                  <FormattedValue value={truncatedValue} />
                </pre>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-md">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                  <FormattedValue value={stringValue} />
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
                <FormattedValue value={truncatedValue} />
              </pre>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                <FormattedValue value={stringValue} />
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
