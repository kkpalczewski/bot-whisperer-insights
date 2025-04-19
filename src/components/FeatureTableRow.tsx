
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { MetadataDialog } from './MetadataDialog';
import { FeatureCell } from './feature/FeatureCell';
import { ValueCell } from './feature/ValueCell';

interface FeatureTableRowProps {
  feature: string;
  value: string | boolean | undefined;
  type?: string;
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
  type,
  parent,
  level,
  onToggle,
  isExpanded,
  hasChildren,
  description,
  error,
  isTruncated
}) => {
  const id = parent ? `${parent}.${feature}` : feature;
  
  return (
    <TableRow className={error ? 'bg-red-950/20' : ''}>
      <TableCell className="py-2 align-top">
        <FeatureCell
          feature={feature}
          level={level}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
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
        <ValueCell 
          value={value} 
          type={type} 
          error={error}
        />
      </TableCell>
    </TableRow>
  );
};
