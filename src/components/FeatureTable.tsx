
import React from 'react';
import { Table, TableBody, TableHeader, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { FeatureTableRow } from './FeatureTableRow';
import { FeatureNode } from '@/hooks/useFeatureTree';

interface FeatureTableProps {
  nodes: FeatureNode[];
  isLoading: boolean;
  onToggleNode: (id: string) => void;
}

export const FeatureTable: React.FC<FeatureTableProps> = ({
  nodes,
  isLoading,
  onToggleNode
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-800">
          <TableHead className="w-[45%] font-medium text-xs py-2">Feature</TableHead>
          <TableHead className="w-[15%] font-medium text-xs py-2">Parent</TableHead>
          <TableHead className="w-[35%] font-medium text-xs py-2">Value</TableHead>
          <TableHead className="w-[5%] py-2"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <FeatureTableRow
            key={node.id}
            node={node}
            onToggle={onToggleNode}
          />
        ))}
        {nodes.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-gray-400">
              {isLoading ? 'Loading features...' : 'No features found'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
