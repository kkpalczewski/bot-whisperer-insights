
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileJson, FileCode, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureTableRowProps {
  feature: string;
  value: string;
  parent: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  level?: number;
}

const getTypeIcon = (value: string) => {
  if (value === 'true' || value === 'false' || value === 'Yes' || value === 'No') 
    return <FileCode className="h-4 w-4 text-blue-400" />;
  if (!isNaN(Number(value))) 
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
  level = 0
}) => {
  return (
    <TableRow 
      className={`${isExpanded ? 'bg-gray-800/20' : 'hover:bg-gray-800/50'}`}
    >
      <TableCell className="p-2 pl-4 w-1/2">
        <div className="flex items-center">
          <div style={{ marginLeft: `${level * 16}px` }} className="flex items-center">
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
            <span className="font-mono text-xs text-gray-300">{feature}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-2 w-8">
        {getTypeIcon(value)}
      </TableCell>
      <TableCell className="p-2 w-1/3 font-mono text-xs font-medium text-white">
        {value}
      </TableCell>
      <TableCell className="p-2 w-1/6 text-xs text-gray-400">
        {parent}
      </TableCell>
    </TableRow>
  );
};
