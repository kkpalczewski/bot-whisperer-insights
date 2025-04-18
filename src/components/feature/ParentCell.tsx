
import React from 'react';

interface ParentCellProps {
  parent: string;
}

export const ParentCell: React.FC<ParentCellProps> = ({ parent }) => {
  return (
    <span className="text-xs font-mono text-gray-400 truncate">{parent || "—"}</span>
  );
};
