
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileJson, FileCode, FileText } from 'lucide-react';

interface FeatureTableRowProps {
  codeName: string;
  fieldName: string;
  value: string;
  parent: string;
  isExpanded?: boolean;
}

const getTypeIcon = (value: string) => {
  if (value === 'true' || value === 'false') return <FileCode className="h-4 w-4 text-blue-400" />;
  if (!isNaN(Number(value))) return <FileText className="h-4 w-4 text-green-400" />;
  return <FileJson className="h-4 w-4 text-purple-400" />;
};

export const FeatureTableRow: React.FC<FeatureTableRowProps> = ({
  codeName,
  fieldName,
  value,
  parent,
  isExpanded
}) => {
  return (
    <TableRow className={`${!isExpanded ? 'hover:bg-gray-800/50' : 'bg-gray-800/20'}`}>
      <TableCell className="w-64 font-mono text-xs text-gray-300">
        {codeName}
      </TableCell>
      <TableCell className="w-8">
        {getTypeIcon(value)}
      </TableCell>
      <TableCell className="w-96 font-mono text-xs font-medium text-white">
        {value}
      </TableCell>
      <TableCell className="w-32 text-xs text-gray-400">
        {parent}
      </TableCell>
    </TableRow>
  );
};
