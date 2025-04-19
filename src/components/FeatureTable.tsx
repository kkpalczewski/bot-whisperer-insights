
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
          <TableHead className="w-[35%] font-medium text-xs py-2">Feature</TableHead>
          <TableHead className="w-[5%] py-2"></TableHead>
          <TableHead className="w-[25%] font-medium text-xs py-2">Value</TableHead>
          <TableHead className="w-[25%] font-medium text-xs py-2">Parent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <FeatureTableRow
            key={node.id}
            feature={node.feature}
            value={node.value}
            type={node.type}
            parent={node.parent}
            isExpanded={node.isExpanded}
            hasChildren={node.children.length > 0}
            onToggle={() => onToggleNode(node.id)}
            level={node.level}
            error={node.error}
            description={node.description}
            isTruncated={node.isTruncated}
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

